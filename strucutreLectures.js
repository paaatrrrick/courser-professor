const fs = require('fs');
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { HumanMessage } = require("langchain/schema");
const { PromptTemplate } = require("langchain/prompts");
const { z } = require("zod");
const { StructuredOutputParser } = require("langchain/output_parsers");
const openAIKey = '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';
const file = require('./lectureInfo.json');

const timeStringToUniqueNumber = (timeString) => {
    var splittedTime = timeString.split(':');
    if (splittedTime.length === 2) {
        return parseInt(splittedTime[0]) * 60 + parseInt(splittedTime[1]);
    }
    return parseInt(splittedTime[0]) * 3600 + parseInt(splittedTime[1]) * 60 + parseInt(splittedTime[2]);
}


//startTime looks like 10:09 or it could include hours
//endTime looks like 10:19 or it could include hours
//timeStampToContent looks like {10:09: 'hello', 10:10: 'world', 10:11: 'hello', 10:12: 'world'}
//return a string containing all the text between startTime and endTime inclusive
const textInRange = (startTime, endTime, timeStampToContent) => {
    var result = '';
    var start = timeStringToUniqueNumber(startTime);
    var end = timeStringToUniqueNumber(endTime);
    for (let i = start; i <= end; i++) {
        if (i in timeStampToContent) {
            result += timeStampToContent[i];
            //add a new line
            if (i !== end) {
                result += '\n';
            }
        }
    }
    return result;    
}

const mergeTimestampsAndContent = (timeStamps, content) => {
    const maxLength = 30000;
    const result = [];
    let currentString = '';
    for (let i = 0; i < timeStamps.length; i++) {
      const timestamp = timeStamps[i];
      const line = `${timestamp}\n${content[i]}\n`;
      if (currentString.length + line.length > maxLength) {
        result.push(currentString);
        currentString = '';
      }
      currentString += line;
    }
    if (currentString.length > 0) {
      result.push(currentString);
    }
    return result;
  };

const parserFile = async (text, fileName) => {
    const lines = text.split('\n');
    const timeStamps = [];
    const content = [];
    const timeStampToContent = {};
    for (let i = 1; i < lines.length; i++) {
        //if odd line append to timeStampts
        if (i % 2 === 1) {
            timeStamps.push(lines[i]);
        } else {
            content.push(lines[i]);
            timeStampToContent[timeStringToUniqueNumber(lines[i - 1])] = lines[i];
        }
    }
    const URL = lines[0];

    const mergedStrings = mergeTimestampsAndContent(timeStamps, content);
    var summaries = [];
    for (let i = 0; i < mergedStrings.length; i++) {
        const currentSummary = await callOpenAI(mergedStrings[i]);
        //merge summaries
        summaries = summaries.concat(currentSummary);
    }
    var largestTime = timeStamps[timeStamps.length - 1];
    largestTime = largestTime.split(':')[0];
    const formatted = summaryFormatter(summaries, fileName, URL, timeStampToContent);
    return formatted;
}

const summaryFormatter = (summaries, fileName, URL, timeStampToContent) => {
    const result = [];
    for (let i = 0; i < summaries.length; i++) {
        const summary = summaries[i];
        const lectureTitle = fileName;
        const chunkTitle = summary.title;
        const start = summary.startTimeStamp;
        const end = summary.endTimeStamp;
        const chunkSummary = summary.summary;
        const content = textInRange(start, end, timeStampToContent);
        const link = URL;
        result.push({lectureTitle, link, chunkTitle, chunkSummary, start, end, content});
    }

    return result;
}



const callOpenAI = async (text) => {
    const parserFromZod = StructuredOutputParser.fromZodSchema(z.array(z.object({
        title: z.string().describe("Example of a title: 'The Role of Stress in Evolution'"),
        summary: z.string().describe("Example of a summary: 'Professor Ippolito discusses the significance of introducing stress into the environment for evolution to happen. He draws parallels between students' decision to pursue education and the need for stress in driving change. Stress, he explains, is a signal that something needs to change for adaptation and improvement.'"),
        startTimeStamp: z.string().describe("Example start time: '9:21'"),
        endTimeStamp: z.string().describe("Example end time: '10:19'"),
  })));
    const formatInstructions = parserFromZod.getFormatInstructions()
    const template = `Break the following lecture up into distinct sections with titles, summaries, start and endtime stamps? ${text}\n{format_instructions}.`;
    const prompt = new PromptTemplate({template: template, inputVariables: [], partialVariables: { format_instructions: formatInstructions }});
    const input = await prompt.format();
    const model = new ChatOpenAI({modelName: "gpt-3.5-turbo-16k",temperature: 0, openAIApiKey: openAIKey});
    const response = await model.call([new HumanMessage(input)]);
    const output = await parserFromZod.parse(response.text);
    return output;
}

const writeFile =  (output) => {
    fs.writeFile('lectureInfo.json', JSON.stringify(output), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('done');
    });
}


const getFileNames = () => {
    const files = fs.readdirSync('./lectures');
    for (let i = 0; i < files.length; i++) {
        files[i] = files[i].slice(0, -4);
    }
    return files;
}
//get all the file names in the lectures folder


const main = async () => {
    const fileNames = getFileNames();
    var output = [];
    for (let i = 0; i < fileNames.length; i++) {
        const name = fileNames[i];
        console.log('');
        console.log(`${i + 1}/${fileNames.length}`);
        console.log(name);
        var canPass = false;
        fs.readFile(`lectures/${name}.txt`, 'utf8', async (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            const array = await parserFile(data, name);
            output = output.concat(array);
            writeFile(output);
            canPass = true;
          });
        while (!canPass) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    //write output to a json file
}

main();


//load in the json file

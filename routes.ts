import express, { Request, Response, Router } from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import { Pinecone, Index, PineconeRecord, QueryResponse, ScoredPineconeRecord } from '@pinecone-database/pinecone';
import { Document, SummaryIndex, ServiceContext, serviceContextFromDefaults, OpenAI, BaseQueryEngine } from "llamaindex";
import * as dotenv from 'dotenv'
dotenv.config()
// Load environment variables
// import('dotenv').then(({ default: dotenv }) => {
//     dotenv.config();
// });  



const Routes: Router = express.Router();
const course: string = "bio-228-microbiology";
const pinecone: Pinecone = new Pinecone({
    //@ts-ignore
    environment: process.env.PINECONE_ENVIRONMENT,
    //@ts-ignore
    apiKey: process.env.PINECONE_API_KEY
});

Routes.get('/test', async (req: Request, res: Response) => {
  res.status(200).send('successful: live server');
});

Routes.post('/answer', async (req: Request, res: Response) => {
    console.log("hit");
    const query: string = req.body.prompt; //"What is the significance of horshoe crabs?"
    console.log(query, req.body);
    const queryEmbedding: Array<number> = await fetchEmbedding(query);
    console.log("made query embedding");
    const pineconeIndex: Index = pinecone.Index(course);
    const pineconeRes: QueryResponse = await pineconeIndex.query({ topK: 3, vector: queryEmbedding});
    const matches: Array<ScoredPineconeRecord> = pineconeRes.matches;
    const chunks: Array<Chunk> = getChunks();

    const relevantChunks: Array<Chunk> = [];
    const documents: Array<Document> = [];
    for (const match of matches){
        const relevantChunk: Chunk = chunks[Number(match.id)];
        relevantChunks.push(relevantChunk);
        const combinedText: string = relevantChunk.lectureTitle + "\n" + relevantChunk.chunkTitle + "\n" + relevantChunk.chunkSummary + "\n" + relevantChunk.content;
        documents.push(new Document({ text: combinedText }));
    }

    // Specify LLM model
    const serviceContext: ServiceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });

    // Indexing
    const llamaIndex: SummaryIndex = await SummaryIndex.fromDocuments(documents, { serviceContext });
    console.log("made summary index");
    // Make query
    const queryEngine: BaseQueryEngine = llamaIndex.asQueryEngine();
    const llamaResponse = await queryEngine.query(
        query
    );
    const answer: string = llamaResponse.toString();
    console.log(answer);
    type Source = {
        url: string,
        number: number,
        type?: string,
        title?: string,
    }
    const sources : Array<Source> = []
    for (let i = 0; i < relevantChunks.length; i++) {
        const chunk : Chunk = relevantChunks[i];
        sources.push({
            url: linkFormatter(chunk.link, chunk.start),
            title: `${chunk.lectureTitle} (${chunk.start})`,
            type: "YouTube",
            number: i  
        })
    }
    res.json({ answer: answer, sources });
    // at the end of response, concatenate source links from chunks (can add start timestamp to these)
    // return response+links chunks to to client
});

const linkFormatter = (link: string, startTime: string) : string => {
    const splitted = startTime.split(':');
    var totalSeconds : number = 0
    if (splitted.length == 3) {
        //Hours
        totalSeconds += parseInt(splitted[0]) * 3600
        //Minutes
        totalSeconds += (parseInt(splitted[1]) * 60)
        //Seconds
        totalSeconds += parseInt(splitted[2])
    } else {
        //Minutes
        totalSeconds += (parseInt(splitted[0]) * 60)
        //Seconds
        totalSeconds += parseInt(splitted[1])
    }
    const newLink : string = `${link}&t=${totalSeconds}`
    return newLink
}

Routes.get('/vectorize', async (req: Request, res: Response) => {
  try {
    // await vectorize();
    res.status(200).send('successful: vectorized');
  } catch (err) {
    res.status(500).send('error: ' + err);
  }
});

const vectorize = async (): Promise<void> => {
    // get list of transcript chunks from lectureInfo.json
    const chunks: Array<Chunk> =  getChunks();

    // make pinecone / retrieve Pinecone index to put chunk embeddings in
    try {
        await pinecone.createIndex({
            name: course,
            dimension: 1536,
            waitUntilReady: true
        });
    } catch (err) {
        console.log('Error creating Pinecone index:', err);
    }

    const index: Index = pinecone.index(course);
    console.log("done making index", chunks.length);
    // for each chunk, make embedding, and put in records list
    for (let i: number = 0; i < chunks.length; i++) {
        const chunk: Chunk = chunks[i];
        const chunkEmbedding: number[] = await fetchEmbedding(JSON.stringify(chunk)); // choosing to embed the entire chunk object instead of just title + summary + content string
        const record: PineconeRecord = { id: String(i), values: chunkEmbedding };
        await index.upsert([record]);
        console.log("vector", i, "done");
    };
};

const getChunks = (): Array<Chunk> => {
    let text: string = "";
    try {
        text = fs.readFileSync('./lectureInfo.json', 'utf-8');
    } catch (err) {
        console.error('Error reading the file:', err);
    }
    const chunks: Array<Chunk> = JSON.parse(text);
    return chunks;
}

const fetchEmbedding = async(input: string): Promise<number[]> => {
    const url: string = 'https://api.openai.com/v1/embeddings';
    // openai embeddings endpoint does not have type definitions as far as I can tell, so we use 'any' for data dependent on that endpoint, but the function must return an embedding
    const data: any = {
        input: input,
        model: 'text-embedding-ada-002',
    };

    try {
        const response: any = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData: any = await response.json();
        return jsonData.data[0].embedding;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

Routes.use((err: Error, req: Request, res: Response) => {
  console.log(err); // Log the stack trace of the error
  res.status(500).json({ error: `Internal error: ${err.message}` });
});

type Chunk  = {
    lectureTitle: string;
    link: string;
    chunkTitle: string;
    chunkSummary: string;
    start: string;
    end: string;
    content: string;
};

export default Routes;
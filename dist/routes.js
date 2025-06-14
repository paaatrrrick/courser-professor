var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document, SummaryIndex, serviceContextFromDefaults, OpenAI } from "llamaindex";
import * as dotenv from 'dotenv';
dotenv.config();
// Load environment variables
// import('dotenv').then(({ default: dotenv }) => {
//     dotenv.config();
// });
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const QASchema = new Schema({
    query: { type: String, required: false },
    response: { type: String, required: false }
});
const QA = mongoose.model('QA', QASchema);
const Routes = express.Router();
const course = "bio-228-microbiology";
const pinecone = new Pinecone({
    //@ts-ignore
    apiKey: process.env.PINECONE_API_KEY
});
Routes.get('/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send('successful: live server');
}));
Routes.post('/answer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hit");
    const query = req.body.prompt; //"What is the significance of horshoe crabs?"
    console.log(query, req.body);
    const queryEmbedding = yield fetchEmbedding(query);
    console.log("made query embedding");
    const pineconeIndex = pinecone.Index(course);
    console.log('a');
    const pineconeRes = yield pineconeIndex.query({ topK: 3, vector: queryEmbedding });
    console.log('b');
    const matches = pineconeRes.matches;
    const chunks = getChunks();
    const relevantChunks = [];
    const documents = [];
    for (const match of matches) {
        const relevantChunk = chunks[Number(match.id)];
        relevantChunks.push(relevantChunk);
        const combinedText = relevantChunk.lectureTitle + "\n" + relevantChunk.chunkTitle + "\n" + relevantChunk.chunkSummary + "\n" + relevantChunk.content;
        documents.push(new Document({ text: combinedText }));
    }
    console.log('c');
    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });
    console.log('d');
    // Indexing
    const llamaIndex = yield SummaryIndex.fromDocuments(documents, { serviceContext });
    console.log("made summary index");
    // Make query
    const queryEngine = llamaIndex.asQueryEngine();
    const llamaResponse = yield queryEngine.query({
        query: query
    });
    console.log('e');
    const answer = llamaResponse.toString();
    const sources = [];
    for (let i = 0; i < relevantChunks.length; i++) {
        const chunk = relevantChunks[i];
        sources.push({
            url: linkFormatter(chunk.link, chunk.start),
            title: `${chunk.lectureTitle} (${chunk.start})`,
            type: "YouTube",
            number: i
        });
    }
    const response = answer + "\n" + JSON.stringify(sources);
    console.log(`q: ${query}`, "\n", `a: ${response}`);
    console.log("f");
    //@ts-ignore
    const log = yield QA.create({ query: query, response: response });
    console.log(log);
    res.json({ answer: answer, sources });
}));
const linkFormatter = (link, startTime) => {
    const splitted = startTime.split(':');
    var totalSeconds = 0;
    if (splitted.length == 3) {
        //Hours
        totalSeconds += parseInt(splitted[0]) * 3600;
        //Minutes
        totalSeconds += (parseInt(splitted[1]) * 60);
        //Seconds
        totalSeconds += parseInt(splitted[2]);
    }
    else {
        //Minutes
        totalSeconds += (parseInt(splitted[0]) * 60);
        //Seconds
        totalSeconds += parseInt(splitted[1]);
    }
    const newLink = `${link}&t=${totalSeconds}`;
    return newLink;
};
Routes.get('/vectorize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await vectorize();
        res.status(200).send('successful: vectorized');
    }
    catch (err) {
        res.status(500).send('error: ' + err);
    }
}));
// const vectorize = async (): Promise<void> => {
//     // get list of transcript chunks from lectureInfo.json
//     const chunks: Array<Chunk> =  getChunks();
//     // make pinecone / retrieve Pinecone index to put chunk embeddings in
//     try {
//         await pinecone.createIndex({
//             name: course,
//             dimension: 1536,
//             waitUntilReady: true,
//             spec: {}
//         });
//     } catch (err) {
//         console.log('Error creating Pinecone index:', err);
//     }
//     const index: Index = pinecone.index(course);
//     console.log("done making index", chunks.length);
//     // for each chunk, make embedding, and put in records list
//     for (let i: number = 0; i < chunks.length; i++) {
//         const chunk: Chunk = chunks[i];
//         const chunkEmbedding: number[] = await fetchEmbedding(JSON.stringify(chunk)); // choosing to embed the entire chunk object instead of just title + summary + content string
//         const record: PineconeRecord = { id: String(i), values: chunkEmbedding };
//         await index.upsert([record]);
//         console.log("vector", i, "done");
//     };
// };
const getChunks = () => {
    let text = "";
    try {
        text = fs.readFileSync('./lectureInfo.json', 'utf-8');
    }
    catch (err) {
        console.error('Error reading the file:', err);
    }
    const chunks = JSON.parse(text);
    return chunks;
};
const fetchEmbedding = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://api.openai.com/v1/embeddings';
    // openai embeddings endpoint does not have type definitions as far as I can tell, so we use 'any' for data dependent on that endpoint, but the function must return an embedding
    const data = {
        input: input,
        model: 'text-embedding-ada-002',
    };
    try {
        const response = yield fetch(url, {
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
        const jsonData = yield response.json();
        console.log(jsonData);
        if (jsonData.error) {
            throw new Error(`Error from OpenAI API: ${jsonData.error.message}`);
        }
        return jsonData.data[0].embedding;
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
});
Routes.use((err, req, res) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});
export default Routes;
// export interface QAAttributes {
//     query?: string;
//     response?: string;
// }
// export interface QADocument extends mongoose.Document {
//     query: string;
//     response: string;
// }
// declare const QAModel: mongoose.Model<QADocument>;
// export = QAModel;

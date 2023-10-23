"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var node_fetch_1 = require("node-fetch");
var fs_1 = require("fs");
var pinecone_1 = require("@pinecone-database/pinecone");
var llamaindex_1 = require("llamaindex");
var dotenv = require("dotenv");
dotenv.config();
// Load environment variables
// import('dotenv').then(({ default: dotenv }) => {
//     dotenv.config();
// });  
var Routes = express_1.default.Router();
var course = "bio-228-microbiology";
var pinecone = new pinecone_1.Pinecone({
    //@ts-ignore
    environment: process.env.PINECONE_ENVIRONMENT,
    //@ts-ignore
    apiKey: process.env.PINECONE_API_KEY
});
Routes.get('/test', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.status(200).send('successful: live server');
        return [2 /*return*/];
    });
}); });
Routes.post('/answer', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, queryEmbedding, pineconeIndex, pineconeRes, matches, chunks, relevantChunks, documents, _i, matches_1, match, relevantChunk, combinedText, serviceContext, llamaIndex, queryEngine, llamaResponse, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("hit");
                query = req.body.prompt;
                console.log(query, req.body);
                return [4 /*yield*/, fetchEmbedding(query)];
            case 1:
                queryEmbedding = _a.sent();
                console.log("made query embedding");
                pineconeIndex = pinecone.Index(course);
                return [4 /*yield*/, pineconeIndex.query({ topK: 3, vector: queryEmbedding })];
            case 2:
                pineconeRes = _a.sent();
                matches = pineconeRes.matches;
                chunks = getChunks();
                relevantChunks = [];
                documents = [];
                for (_i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
                    match = matches_1[_i];
                    relevantChunk = chunks[Number(match.id)];
                    relevantChunks.push(relevantChunk);
                    combinedText = relevantChunk.lectureTitle + "\n" + relevantChunk.chunkTitle + "\n" + relevantChunk.chunkSummary + "\n" + relevantChunk.content;
                    documents.push(new llamaindex_1.Document({ text: combinedText }));
                }
                serviceContext = (0, llamaindex_1.serviceContextFromDefaults)({
                    llm: new llamaindex_1.OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
                });
                return [4 /*yield*/, llamaindex_1.SummaryIndex.fromDocuments(documents, { serviceContext: serviceContext })];
            case 3:
                llamaIndex = _a.sent();
                console.log("made summary index");
                queryEngine = llamaIndex.asQueryEngine();
                return [4 /*yield*/, queryEngine.query(query)];
            case 4:
                llamaResponse = _a.sent();
                answer = llamaResponse.toString();
                console.log(answer);
                res.json({ answer: answer });
                return [2 /*return*/];
        }
    });
}); });
Routes.get('/vectorize', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            // await vectorize();
            res.status(200).send('successful: vectorized');
        }
        catch (err) {
            res.status(500).send('error: ' + err);
        }
        return [2 /*return*/];
    });
}); });
var vectorize = function () { return __awaiter(void 0, void 0, void 0, function () {
    var chunks, err_1, index, i, chunk, chunkEmbedding, record;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chunks = getChunks();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, pinecone.createIndex({
                        name: course,
                        dimension: 1536,
                        waitUntilReady: true
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log('Error creating Pinecone index:', err_1);
                return [3 /*break*/, 4];
            case 4:
                index = pinecone.index(course);
                console.log("done making index", chunks.length);
                i = 0;
                _a.label = 5;
            case 5:
                if (!(i < chunks.length)) return [3 /*break*/, 9];
                chunk = chunks[i];
                return [4 /*yield*/, fetchEmbedding(JSON.stringify(chunk))];
            case 6:
                chunkEmbedding = _a.sent();
                record = { id: String(i), values: chunkEmbedding };
                return [4 /*yield*/, index.upsert([record])];
            case 7:
                _a.sent();
                console.log("vector", i, "done");
                _a.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 5];
            case 9:
                ;
                return [2 /*return*/];
        }
    });
}); };
var getChunks = function () {
    var text = "";
    try {
        text = fs_1.default.readFileSync('./lectureInfo.json', 'utf-8');
        console.log('File content:', text);
    }
    catch (err) {
        console.error('Error reading the file:', err);
    }
    var chunks = JSON.parse(text);
    return chunks;
};
var fetchEmbedding = function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var url, data, response, jsonData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = 'https://api.openai.com/v1/embeddings';
                data = {
                    input: input,
                    model: 'text-embedding-ada-002',
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, node_fetch_1.default)(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer ".concat(process.env.OPENAI_API_KEY),
                        },
                        body: JSON.stringify(data),
                    })];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("HTTP error! Status: ".concat(response.status));
                }
                return [4 /*yield*/, response.json()];
            case 3:
                jsonData = _a.sent();
                return [2 /*return*/, jsonData.data[0].embedding];
            case 4:
                error_1 = _a.sent();
                console.error('Error:', error_1);
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
Routes.use(function (err, req, res) {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: "Internal error: ".concat(err.message) });
});
exports.default = Routes;

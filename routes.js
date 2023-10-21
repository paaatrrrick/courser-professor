if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const Routes = express.Router();

Routes.get('/answer', async (req, res) => {
    // get query from request body or something
    // embed query
    // search pincecone index based on query, k = 5 (arbitrary number)
    // you will get [{id: id, values: embedding}, ... ] back i think, use ids to retrieve the relevant chunk objs from our json
    // documents = []
    // for each chunk:
    //  documents.push(new Document({ text: chunk.content })); maybe include title / summary instead of just content
    // send query and documents to llamaindex 
    // get response
    // at the end of response, concatenate source links from chunks (can add start timestamp to these)
    // return response+links chunks to to client
});

vectorize = async() => {
    // assuming there's a json file with: [    {lectureTitle: , link: , chunkTitle: , chunkSummary: start:, end: , content: },  ...   ]
    // iterate through that array
    // make pinecone index
    // let records = []
    // for each chunk:
        // make embedding of the title + " " summary + " " + content concatenated)
        // records.push({ id: id, values: currEmbedding.data[0].embedding });
    // await index.upsert(records);
};

Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;
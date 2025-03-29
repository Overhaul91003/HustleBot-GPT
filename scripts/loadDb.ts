// File that will be resposible for Loading our Data into our DataStacx Database . We are essentially going to scrape teh Internet fro newest up to date data .

import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";  
import OpenAI from "openai"

import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"

import "dotenv/config"

// Basically computes the Similarity of 2 vectors . 
// In ASTRADB -> 'cosine' is selected by default . It determines how Similar 2 vectors are 2 one another .
// The dot-product algorithm is 50 % faster than 'cosine' however , it requires the vector to be normalized . In cosine the vector does not need to be normalized .
// When you want to Find out how close 2 vectors are then you use 'euclidean' is the most commomly used . is euclidean value is small then 2 vectors are closely related , if large value then vectors are far apart .

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { 
        ASTRA_DB_NAMESPACE ,
        ASTRA_DB_COLLECTION , 
        ASTRA_DB_API_ENDPOINT , 
        ASTRA_DB_APPLICATION_TOKEN , 
        OPENAI_API_KEY 

} = process.env 

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

//Websites that we want to scrape .

const startup_data = [
    // Indian Startup Discovery
    'https://growthlist.co/india-startups/',
    'https://topstartups.io/?hq_location=india',
    'https://www.failory.com/startups/india',
    'https://www.sutrahr.com/top-100-startups-in-india-2025/',
    'https://www.digitalvidya.com/blog/top-startups-in-india/',
    'https://www.fynd.academy/blog/top-startups-in-india',
    'https://yourstory.com/category/ys-startup',
    'https://keevurds.com/noise_category/startup-news/',
    'https://inc42.com/buzz/',
    'https://www.startupindia.gov.in/',
    'https://www.indianweb2.com/2020/09/',
    'https://entrackr.com/',
    'https://www.techcircle.in/category/startups',
    'https://officechai.com/category/startups/',
    'https://economictimes.indiatimes.com/tech/startups',
    'https://startupsuccessstories.com/',
    'https://startupsindia.in/startups-stories/',
    'https://techgraph.co/?s=startup',
    'https://startuptalky.com/tag/startuptalkers/',
    'https://yournest.in/',
    'https://www.medianama.com/?s=startup',
    'https://www.vccircle.com/tag/startups/all',
    'https://techcrunch.com/category/startups/',
    'https://www.revli.com/india-funded-startups',
    'https://www.seedtable.com/best-startups-in-india',
    'https://www.ventureintelligence.com/Indian-Unicorn-Tracker.php',
    'https://startuptalky.com/indian-startups-funding-investors-data-2025/',
    'https://www.tice.news/tice-trending/weekly-indian-startup-report-funding-trends-new-ventures-and-strategic-shifts-7582253',

    //Foreign startup Discovery 
    'https://growthlist.co/funded-startups/',
    'https://www.startupstream.io/',
    'https://www.geekwire.com/startups/',
    'https://www.geekwire.com/fundings/',
    'https://startuplister.com/',
    'https://startups.gallery/',

]


const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE})


// Spllitting into Chunks 

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollection = async (SimilarityMetric:SimilarityMetric = "dot_product") =>{
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector:{
           dimension: 1536 ,
           metric: SimilarityMetric
        }
    })

    console.log(res) ;
}


const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of startup_data){
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await ( const chunk of chunks ) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })

            const vector = embedding.data[0].embedding

            const res = await collection.insertOne({
                $vector: vector ,
                text: chunk
            })

            console.log(res) ;
        }
    }
}


//Function to scrape the Page and extract Information 
const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions:{
            headless: true,
        },

        gotoOptions: {
            waitUntil: "domcontentloaded"
        },

        evaluate: async (page , browser) => {
            const result = await page.evaluate(() => 
                document.body.innerHTML
            )

            await browser.close()
            return result ;
        }
    })

    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

createCollection().then(() => loadSampleData())


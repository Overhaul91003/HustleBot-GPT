import OpenAI from "openai" 
import { OpenAIStream , StreamingTextResponse } from "ai"
import { DataAPIClient } from "@datastax/astra-db-ts"

const { 
    ASTRA_DB_NAMESPACE ,
    ASTRA_DB_COLLECTION , 
    ASTRA_DB_API_ENDPOINT , 
    ASTRA_DB_APPLICATION_TOKEN , 
    OPENAI_API_KEY 

} = process.env 

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT,{ namespace : ASTRA_DB_NAMESPACE})

export async function POST(req: Request )
{
    
    try{
        const { messages } = await req.json()
        const latestMessage = messages[messages.length - 1]?.content

        let docContext = ""

        const embedding = await openai.embeddings.create({
            model:"text-embedding-3-small",
            input:latestMessage,
            encoding_format:"float",
        })

        try{
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null,{
                sort:{
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)

        }catch(err){
            console.log("Error querying db...") 
            docContext=""
        }

        const template = {
            role: "system",
            content: `
            You are HustleBot-GPT, an AI Assistant that provides expert insights into the Indian startup ecosystem.
            Use the below Context to enhance your knowledge with real-time updates on startup trends, funding news, regulatory changes, and emerging business opportunities.
            
            The context includes the latest data from sources like Inc42, YourStory, TechCrunch India, Economic Times, and government startup policies and many more sites .The info mainly revolves around
            startup culture  like : emerging startups, funding trends, and market shifts, all based primarily on 2025.
        
            If the required information isn’t available, provide an answer based on your own knowledge without referencing any sources or context. Respond naturally, as if you already know the answer.
            
            Format responses using markdown where applicable, and avoid returning images.
            
            ----------
        
            START CONTEXT
            ${docContext}
            END CONTEXT
            -----------
        
            QUESTION: ${latestMessage}
            -----------
            `
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            stream: true ,
            messages: [template, ...messages]
        })


        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    } catch (err) {

        throw err ;
        
    }
}
"use client"
import Image from "next/image";
import Logo from "./assets/Logo.png";

import { useChat } from 'ai/react'
import { Message } from "ai";
import { useEffect, useRef } from "react";

import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";


const Home = () => {
    const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();
    const chatRef = useRef<HTMLDivElement>(null);

    const noMessages = !messages || messages.length === 0;

    const handlePrompt = (promptText) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user",
        };
        append(msg);
    };

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
    

    return (
        <main>
            <Image src={Logo} width="250" alt="HustleBot-gpt" />
            <section className={`${noMessages ? "" : "populated"}`}>
                <div className="scrollbar">
                    {noMessages ? (
                        <>
                            <p className="starter-text">
                            Welcome to HustleBot-GPT 🚀—your AI-powered startup companion! Stay ahead with real-time insights on emerging startups, funding trends, 
                            and market shifts, all based primarily on 2025. Whether you're an entrepreneur, investor, or enthusiast, get expert-backed analysis, the 
                            latest startup news, funding updates, and innovative business ideas—all in one place. Let’s build the future, one startup at a time! 
                            </p>
                            <br />
                            <PromptSuggestionsRow onPromptClick={handlePrompt} />
                        </>
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <Bubble key={`message-${index}`} message={message} />
                            ))}
                            {isLoading && <LoadingBubble />}
                        </>
                    )}
                </div>
            </section>

            <form onSubmit={handleSubmit}>
                    <input className="question-box"  onChange={handleInputChange} value={input} placeholder="Ask me Something....."/>
                    <input type="submit" />
            </form>
        </main>
    );
};

export default Home ;


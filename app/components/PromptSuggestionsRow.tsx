import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({ onPromptClick }) => {

  const prompts = [

    // Startup Trends and Market Insights
    "What are the top 3 trending startup sectors in India right now?",
    "Which Indian cities are emerging as startup hubs in 2025?",
    "What are the key challenges faced by Indian startups in 2025?",
    "How are Indian startups leveraging AI and automation for growth?",
    "What are the most promising deep-tech startups in India this year?",
    
    // Funding and Investment Trends
    "Summarize the latest startup funding rounds in India this week.",
    "How has startup funding in India changed in Q1 2025 compared to 2024?",
    "Which sectors are attracting the highest VC funding in India right now?",
    "What are the top early-stage startups that have secured funding recently?",
    "How do Indian startup funding trends compare to the US and Europe?",
    
    // Government Policies and Regulations
    "How does the 2025-26 Indian budget impact startups?",
    "What are the latest government incentives for Indian startups?",
    "How is the Indian government supporting AI and fintech startups?",
    "What are the key regulatory challenges faced by Indian crypto startups?",
    "How do recent tax policy changes affect startup founders and investors?",
    
    //Innovative startup Ideas and Buisness Models
    "Suggest 5 innovative startup ideas in AI, fintech, or sustainability.",
    "What are the most disruptive Indian startups of 2025?",
    "How are Indian startups innovating in the space tech sector?",
    "What are the latest trends in D2C (Direct-to-Consumer) startups in India?",
    "How are Indian startups leveraging Web3 and blockchain technology?",

  ]

  // Function to shuffle the array and select 5 random questions
  const getRandomPrompts = (arr, num) => {
    return arr.sort(() => Math.random() - 0.5).slice(0, num);
  };

  const selectedPrompts = getRandomPrompts(prompts, 5);

  return (
    <div className="prompt-suggestion-row">
      {selectedPrompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionsRow;

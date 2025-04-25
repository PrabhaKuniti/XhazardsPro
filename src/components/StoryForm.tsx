
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface StoryPreferences {
  mood: string;
  genre: string;
  length: number;
  prompt: string;
}

const moodStories = {
  calm: {
    title: "The Garden of Whispers",
    baseContent: [
      "In a valley nestled between two ancient mountains, there existed a garden unlike any other. The Garden of Whispers, it was called, where the flowers spoke in soft murmurs and the trees held the wisdom of centuries in their roots.",
      "Elena found this place by accident—or perhaps by destiny—when seeking refuge from the storm of her thoughts. As she wandered through the peaceful paths, each step brought a deeper sense of tranquility."
    ]
  },
  anxious: {
    title: "The Lighthouse Keeper's Breath",
    baseContent: [
      "Sarah stood at the top of the lighthouse, her racing thoughts matching the rhythm of the crashing waves below. The familiar ritual of lighting the beacon brought her back to the present moment.",
      "With each deep breath, she focused on the steady beam of light cutting through the darkness, remembering that even the stormiest seas eventually find their calm."
    ]
  },
  sad: {
    title: "The Colors of Tomorrow",
    baseContent: [
      "In a world that had temporarily lost its color, Maya discovered a small box of magical paintbrushes. Each stroke she made brought not just color, but memories of joy and hope back into her world.",
      "As she painted, she realized that even the darkest blues and greys had their own beauty, and that every sunrise brings a fresh canvas."
    ]
  },
  happy: {
    title: "Dance of the Fireflies",
    baseContent: [
      "The meadow came alive at dusk, as thousands of fireflies rose from the grass like stars taking flight. Jamie couldn't help but dance among them, his laughter joining their light in the warm summer air.",
      "Each tiny light seemed to mirror the joy in his heart, creating a symphony of happiness that lit up the entire valley."
    ]
  }
};

// Helper function to adjust story length
const adjustStoryLength = (content: string[], lengthFactor: number) => {
  // Base case - return the content as is for medium length (around 50)
  if (lengthFactor >= 40 && lengthFactor <= 60) {
    return content;
  }
  
  // For shorter stories, trim some content
  if (lengthFactor < 40) {
    return content.map(paragraph => {
      // Trim paragraph by a percentage based on length factor
      const trimFactor = 0.5 + (lengthFactor / 80); // ranges from 0.5 to 1
      const sentences = paragraph.split('. ');
      const keepSentences = Math.max(1, Math.floor(sentences.length * trimFactor));
      return sentences.slice(0, keepSentences).join('. ') + (keepSentences < sentences.length ? '.' : '');
    });
  }
  
  // For longer stories, add more detail
  const expandedContent = [...content];
  
  // Add additional paragraphs for longer stories
  if (lengthFactor > 60) {
    // Number of paragraphs to add depends on length factor
    const extraParagraphs = Math.floor((lengthFactor - 60) / 20) + 1;
    
    for (let i = 0; i < extraParagraphs; i++) {
      expandedContent.push(
        "The journey continued with new discoveries and insights, each moment revealing another layer of meaning.",
        "Time seemed to flow differently here, creating space for reflection and renewal with each passing moment."
      );
    }
  }
  
  return expandedContent;
};

const StoryForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<StoryPreferences>({
    mood: 'calm',
    genre: 'fantasy',
    length: 50,
    prompt: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };

  const handleMoodChange = (value: string) => {
    setPreferences({
      ...preferences,
      mood: value,
    });
  };

  const handleGenreChange = (value: string) => {
    setPreferences({
      ...preferences,
      genre: value,
    });
  };

  const handleLengthChange = (value: number[]) => {
    setPreferences({
      ...preferences,
      length: value[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique ID for the story
    const storyId = uuidv4();
    
    // Get the selected mood's story
    const selectedMood = preferences.mood as keyof typeof moodStories;
    const selectedStory = moodStories[selectedMood];
    
    // Adjust the story content based on the selected length
    const adjustedContent = adjustStoryLength([...selectedStory.baseContent], preferences.length);
    
    // Create the story object with additional metadata
    const storyData = {
      id: storyId,
      title: selectedStory.title,
      content: adjustedContent,
      mood: preferences.mood,
      genre: preferences.genre,
      prompt: preferences.prompt,
      date: new Date().toISOString(),
      preview: selectedStory.baseContent[0].substring(0, 100) + '...',
    };
    
    // Store the current story in localStorage for viewing
    localStorage.setItem('currentStory', JSON.stringify(storyData));
    
    // Add the story to the library in localStorage
    const existingLibraryString = localStorage.getItem('storyLibrary');
    let library = [];
    
    if (existingLibraryString) {
      try {
        library = JSON.parse(existingLibraryString);
        // Ensure library is an array
        if (!Array.isArray(library)) {
          library = [];
        }
      } catch (error) {
        console.error("Failed to parse storyLibrary from localStorage", error);
        library = [];
      }
    }
    
    // Add the new story to the library array
    library.push(storyData);
    
    // Save the updated library back to localStorage
    localStorage.setItem('storyLibrary', JSON.stringify(library));
    
    toast({
      title: "Creating your healing story",
      description: "Please wait while we craft your personalized narrative...",
    });
    
    setTimeout(() => {
      navigate(`/story/${storyId}`);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl">
      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mood" className="text-lg font-serif">How are you feeling today?</Label>
            <RadioGroup 
              id="mood" 
              value={preferences.mood} 
              onValueChange={handleMoodChange}
              className="grid grid-cols-2 md:grid-cols-4 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="calm" id="calm" />
                <Label htmlFor="calm">Calm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anxious" id="anxious" />
                <Label htmlFor="anxious">Anxious</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sad" id="sad" />
                <Label htmlFor="sad">Sad</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="happy" id="happy" />
                <Label htmlFor="happy">Happy</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-lg font-serif">What kind of story would you like?</Label>
            <RadioGroup 
              id="genre" 
              value={preferences.genre} 
              onValueChange={handleGenreChange}
              className="grid grid-cols-2 md:grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fantasy" id="fantasy" />
                <Label htmlFor="fantasy">Fantasy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="adventure" id="adventure" />
                <Label htmlFor="adventure">Adventure</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mystery" id="mystery" />
                <Label htmlFor="mystery">Mystery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="romance" id="romance" />
                <Label htmlFor="romance">Romance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scifi" id="scifi" />
                <Label htmlFor="scifi">Sci-Fi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="historical" id="historical" />
                <Label htmlFor="historical">Historical</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="length" className="text-lg font-serif">Story Length</Label>
              <span className="text-sm text-healer-tertiary">
                {preferences.length < 33 ? 'Short' : preferences.length < 66 ? 'Medium' : 'Long'}
              </span>
            </div>
            <Slider
              id="length"
              defaultValue={[50]}
              max={100}
              step={1}
              onValueChange={handleLengthChange}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-lg font-serif">Specific elements you'd like in your story (optional)</Label>
            <Textarea 
              id="prompt" 
              name="prompt" 
              placeholder="A forest, a magical artifact, a journey home..."
              value={preferences.prompt}
              onChange={handleInputChange}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button type="submit" className="healing-button w-full">
            Create Healing Story
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StoryForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HealingCloud from '@/components/HealingCloud';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  title: string;
  preview: string;
  mood: string;
  genre: string;
  date: string;
  content: string[];
}

const Library = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  
  useEffect(() => {
    // Load stories from localStorage
    const savedStories = localStorage.getItem('storyLibrary');
    if (savedStories) {
      try {
        const parsedStories = JSON.parse(savedStories);
        if (Array.isArray(parsedStories)) {
          setStories(parsedStories);
        } else {
          console.error("storyLibrary is not an array:", parsedStories);
          setStories([]);
          toast({
            title: "Error",
            description: "Your story library has an invalid format. Starting fresh.",
            variant: "destructive",
          });
          // Reset the library to empty array
          localStorage.setItem('storyLibrary', JSON.stringify([]));
        }
      } catch (error) {
        console.error("Failed to parse stories from localStorage", error);
        setStories([]);
        toast({
          title: "Error",
          description: "Failed to load your stories. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleReadStory = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Unknown date";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col story-gradient">
      <Header />
      
      <main className="flex-grow px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto page-transition">
          <div className="text-center mb-8 relative">
            <HealingCloud className="top-[-40px] left-[20%] opacity-40" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              Your <span className="text-gradient">Story Library</span>
            </h1>
            <p className="text-lg text-healer-tertiary/80 max-w-xl mx-auto">
              Revisit the healing narratives created especially for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {stories.length > 0 ? (
              stories.map((story) => (
                <Card 
                  key={story.id}
                  className="bg-white/90 backdrop-blur-sm border-healer-light overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="h-2 bg-gradient-to-r from-healer-primary to-healer-secondary" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-serif font-semibold text-lg text-healer-tertiary">{story.title}</h3>
                      <span className="text-xs text-healer-tertiary/60">{formatDate(story.date)}</span>
                    </div>
                    
                    <p className="text-sm text-healer-tertiary/80 mb-4 line-clamp-3">
                      {story.preview}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 bg-healer-light rounded-full text-healer-tertiary">
                          {story.mood}
                        </span>
                        <span className="text-xs px-2 py-1 bg-healer-light rounded-full text-healer-tertiary">
                          {story.genre}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => handleReadStory(story.id)}
                        className="text-xs px-3 py-1 h-auto bg-healer-primary hover:bg-healer-secondary text-white"
                      >
                        Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-healer-tertiary/80">
                  Your library is empty. Create your first healing story to get started.
                </p>
              </div>
            )}
            
            <Card 
              className="bg-white/70 backdrop-blur-sm border-dashed border-healer-light flex flex-col items-center justify-center p-6 h-[220px] cursor-pointer hover:bg-white/90 transition-all"
              onClick={() => navigate('/create')}
            >
              <div className="w-12 h-12 rounded-full bg-healer-light flex items-center justify-center mb-4">
                <span className="text-3xl text-healer-primary">+</span>
              </div>
              <h3 className="font-serif font-semibold mb-2">Create New Story</h3>
              <p className="text-sm text-healer-tertiary/80 text-center">
                Generate a new healing narrative tailored to your current mood
              </p>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-healer-tertiary/70 italic">
              Your stories are saved locally and are private to you.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Library;

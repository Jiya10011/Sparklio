import React, { useState } from 'react';
import { Sparkles, TrendingUp, Search, X, Lightbulb, Zap } from 'lucide-react';

function ContentTemplates({ onSelectTemplate, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Template Categories
  const categories = [
    { id: 'all', name: 'All Templates', emoji: '✨', count: 45 },
    { id: 'tech', name: 'Tech & AI', emoji: '🤖', count: 8 },
    { id: 'business', name: 'Business', emoji: '💼', count: 7 },
    { id: 'fashion', name: 'Fashion', emoji: '👗', count: 6 },
    { id: 'food', name: 'Food & Drink', emoji: '🍔', count: 5 },
    { id: 'fitness', name: 'Fitness', emoji: '💪', count: 6 },
    { id: 'lifestyle', name: 'Lifestyle', emoji: '🌟', count: 5 },
    { id: 'marketing', name: 'Marketing', emoji: '📱', count: 8 }
  ];

  // Comprehensive Template Library
  const templates = [
    // TECH & AI
    {
      id: 1,
      category: 'tech',
      title: 'AI Productivity Hack',
      prompt: 'Share 5 ways AI can automate your daily tasks and save 10 hours per week. Focus on practical tools like ChatGPT, Notion AI, and automation platforms.',
      platforms: ['linkedin', 'twitter'],
      trending: true,
      tags: ['AI', 'Productivity', 'Automation']
    },
    {
      id: 2,
      category: 'tech',
      title: 'Tech Product Launch',
      prompt: 'Announce our new SaaS product that helps teams collaborate 3x faster. Highlight the problem it solves, key features, and early bird discount.',
      platforms: ['twitter', 'linkedin'],
      trending: false,
      tags: ['Product', 'Launch', 'SaaS']
    },
    {
      id: 3,
      category: 'tech',
      title: 'Coding Tips',
      prompt: 'Share 3 lesser-known coding shortcuts in VS Code that junior developers should know. Make it beginner-friendly with clear examples.',
      platforms: ['twitter', 'instagram'],
      trending: false,
      tags: ['Coding', 'Tips', 'Development']
    },
    {
      id: 4,
      category: 'tech',
      title: 'Tech Career Advice',
      prompt: 'Give advice to someone wanting to transition into tech without a CS degree. Include realistic timeline, resources, and first steps.',
      platforms: ['linkedin', 'twitter'],
      trending: true,
      tags: ['Career', 'Tech', 'Advice']
    },
    {
      id: 5,
      category: 'tech',
      title: 'AI Tools Comparison',
      prompt: 'Compare ChatGPT vs Claude vs Gemini for content creation. Which one is best for different use cases? Include pricing and features.',
      platforms: ['linkedin', 'youtube'],
      trending: true,
      tags: ['AI', 'Comparison', 'Tools']
    },
    {
      id: 6,
      category: 'tech',
      title: 'Cybersecurity Tips',
      prompt: 'Share 5 simple cybersecurity practices everyone should follow in 2025. Focus on password managers, 2FA, and phishing awareness.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Security', 'Tips', 'Privacy']
    },
    {
      id: 7,
      category: 'tech',
      title: 'No-Code Tools',
      prompt: 'List 7 no-code tools that let you build apps, websites, and automations without coding. Perfect for entrepreneurs and beginners.',
      platforms: ['instagram', 'twitter'],
      trending: true,
      tags: ['No-Code', 'Tools', 'Startup']
    },
    {
      id: 8,
      category: 'tech',
      title: 'Future of Work',
      prompt: 'Predict how AI will change the workplace in the next 3 years. Which jobs are safe? Which skills to learn? Be realistic and balanced.',
      platforms: ['linkedin', 'youtube'],
      trending: true,
      tags: ['Future', 'AI', 'Jobs']
    },

    // BUSINESS
    {
      id: 9,
      category: 'business',
      title: 'Startup Failure Lessons',
      prompt: 'Share 3 biggest mistakes I made in my first startup that cost me $50K. What I learned and what I would do differently.',
      platforms: ['linkedin', 'twitter'],
      trending: true,
      tags: ['Startup', 'Lessons', 'Entrepreneurship']
    },
    {
      id: 10,
      category: 'business',
      title: 'Side Hustle Ideas',
      prompt: 'List 10 profitable side hustles you can start with less than $100. Include realistic income expectations and time commitment.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Side Hustle', 'Money', 'Business']
    },
    {
      id: 11,
      category: 'business',
      title: 'Remote Work Tips',
      prompt: 'Share my daily routine as a remote worker that keeps me productive and prevents burnout. Include time blocks and tools I use.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Remote', 'Productivity', 'Work']
    },
    {
      id: 12,
      category: 'business',
      title: 'Negotiation Tips',
      prompt: 'Teach 5 salary negotiation tactics that helped me increase my offer by 30%. Exact scripts and phrases to use.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Career', 'Negotiation', 'Salary']
    },
    {
      id: 13,
      category: 'business',
      title: 'Business Book Summary',
      prompt: 'Summarize The Lean Startup in 10 key takeaways. How to apply these lessons to your business today.',
      platforms: ['linkedin', 'instagram'],
      trending: false,
      tags: ['Books', 'Learning', 'Business']
    },
    {
      id: 14,
      category: 'business',
      title: 'Networking Strategy',
      prompt: 'How I built a network of 500+ industry contacts in 6 months without being salesy. Actionable steps anyone can follow.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Networking', 'Career', 'Growth']
    },
    {
      id: 15,
      category: 'business',
      title: 'Productivity System',
      prompt: 'My complete productivity system: tools, calendar blocking, and habits that 10x my output. Includes free templates.',
      platforms: ['linkedin', 'youtube'],
      trending: true,
      tags: ['Productivity', 'System', 'Tools']
    },

    // FASHION
    {
      id: 16,
      category: 'fashion',
      title: 'Sustainable Fashion',
      prompt: 'Share 7 sustainable fashion brands that are affordable and stylish. Why fast fashion is harmful and how to shop consciously.',
      platforms: ['instagram', 'twitter'],
      trending: true,
      tags: ['Sustainable', 'Fashion', 'Eco']
    },
    {
      id: 17,
      category: 'fashion',
      title: 'Capsule Wardrobe',
      prompt: 'How to build a 30-piece capsule wardrobe that works for all seasons. Save money and look great every day.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Minimalism', 'Wardrobe', 'Style']
    },
    {
      id: 18,
      category: 'fashion',
      title: 'Fashion Trends 2025',
      prompt: 'Predict the top 5 fashion trends for 2025. What is coming back, what is fading out, and what to invest in now.',
      platforms: ['instagram', 'twitter'],
      trending: true,
      tags: ['Trends', 'Fashion', '2025']
    },
    {
      id: 19,
      category: 'fashion',
      title: 'Outfit Formula',
      prompt: 'My 3 go-to outfit formulas that always look put-together. Works for any body type and style preference.',
      platforms: ['instagram', 'twitter'],
      trending: false,
      tags: ['Outfits', 'Style', 'Tips']
    },
    {
      id: 20,
      category: 'fashion',
      title: 'Thrift Shopping Guide',
      prompt: 'How to find designer pieces at thrift stores. My best thrifting tips, where to look, and how to spot quality.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Thrifting', 'Budget', 'Fashion']
    },
    {
      id: 21,
      category: 'fashion',
      title: 'Style for Body Type',
      prompt: 'Dress for your body type: personalized style tips that flatter your shape. Confidence-boosting fashion advice.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Body Positive', 'Style', 'Tips']
    },

    // FOOD & DRINK
    {
      id: 22,
      category: 'food',
      title: 'Easy Meal Prep',
      prompt: 'Share 5 meal prep recipes that take under 30 minutes. Perfect for busy weekdays, includes grocery list and nutrition info.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Meal Prep', 'Recipes', 'Healthy']
    },
    {
      id: 23,
      category: 'food',
      title: 'Budget-Friendly Recipes',
      prompt: 'Cook delicious meals for under $5 per serving. 7 recipes that do not sacrifice taste for cost.',
      platforms: ['instagram', 'twitter'],
      trending: false,
      tags: ['Budget', 'Cooking', 'Recipes']
    },
    {
      id: 24,
      category: 'food',
      title: 'Coffee Shop Drinks',
      prompt: 'Recreate popular Starbucks drinks at home for 1/4 the price. Exact recipes for lattes, frappuccinos, and seasonal favorites.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Coffee', 'DIY', 'Drinks']
    },
    {
      id: 25,
      category: 'food',
      title: 'Food Photography Tips',
      prompt: 'Take Instagram-worthy food photos with just your phone. Lighting, angles, and editing tips from a food photographer.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Photography', 'Food', 'Instagram']
    },
    {
      id: 26,
      category: 'food',
      title: 'Healthy Swaps',
      prompt: 'Replace unhealthy ingredients with nutritious alternatives without losing flavor. 10 easy swaps for everyday cooking.',
      platforms: ['instagram', 'twitter'],
      trending: false,
      tags: ['Healthy', 'Nutrition', 'Tips']
    },

    // FITNESS
    {
      id: 27,
      category: 'fitness',
      title: 'Home Workout Routine',
      prompt: 'Share a 20-minute full-body workout that requires zero equipment. Perfect for beginners, includes video demonstrations.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Workout', 'Home', 'Fitness']
    },
    {
      id: 28,
      category: 'fitness',
      title: 'Weight Loss Journey',
      prompt: 'How I lost 30 pounds in 6 months without restrictive diets. My honest journey, mistakes, and what actually worked.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Weight Loss', 'Journey', 'Motivation']
    },
    {
      id: 29,
      category: 'fitness',
      title: 'Gym Beginner Guide',
      prompt: 'Complete beginner guide to the gym: what to wear, gym etiquette, how to use machines, and first workout plan.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Gym', 'Beginner', 'Fitness']
    },
    {
      id: 30,
      category: 'fitness',
      title: 'Protein-Rich Meals',
      prompt: 'Share 7 high-protein meals that help build muscle. Each meal has 30g+ protein and tastes amazing.',
      platforms: ['instagram', 'twitter'],
      trending: false,
      tags: ['Protein', 'Nutrition', 'Muscle']
    },
    {
      id: 31,
      category: 'fitness',
      title: 'Running for Beginners',
      prompt: 'Couch to 5K plan that anyone can follow. Week-by-week training schedule, motivation tips, and injury prevention.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Running', 'Beginner', '5K']
    },
    {
      id: 32,
      category: 'fitness',
      title: 'Recovery Tips',
      prompt: 'Post-workout recovery routine that reduces soreness and improves gains. Stretching, nutrition, and sleep optimization.',
      platforms: ['instagram', 'twitter'],
      trending: false,
      tags: ['Recovery', 'Fitness', 'Health']
    },

    // LIFESTYLE
    {
      id: 33,
      category: 'lifestyle',
      title: 'Morning Routine',
      prompt: 'My 5 AM morning routine that changed my life. How I became more productive, focused, and energized every day.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Morning', 'Routine', 'Productivity']
    },
    {
      id: 34,
      category: 'lifestyle',
      title: 'Minimalist Living',
      prompt: 'How minimalism improved my mental health and saved me $10K a year. Tips for decluttering and living with less.',
      platforms: ['instagram', 'youtube'],
      trending: false,
      tags: ['Minimalism', 'Lifestyle', 'Money']
    },
    {
      id: 35,
      category: 'lifestyle',
      title: 'Self-Care Routine',
      prompt: 'Weekly self-care checklist that prevents burnout. Mental, physical, and emotional wellness practices that actually work.',
      platforms: ['instagram', 'twitter'],
      trending: true,
      tags: ['Self-Care', 'Wellness', 'Mental Health']
    },
    {
      id: 36,
      category: 'lifestyle',
      title: 'Budget Living',
      prompt: 'Live comfortably on a tight budget: my complete guide to saving money without feeling deprived. Includes spending tracker.',
      platforms: ['instagram', 'twitter'],
      trending: false,
      tags: ['Budget', 'Money', 'Saving']
    },
    {
      id: 37,
      category: 'lifestyle',
      title: 'Travel Hacks',
      prompt: 'Travel the world on a budget: 10 hacks that saved me thousands. Booking tips, packing strategies, and hidden gems.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Travel', 'Budget', 'Tips']
    },

    // MARKETING
    {
      id: 38,
      category: 'marketing',
      title: 'Instagram Growth',
      prompt: 'How I grew from 0 to 10K Instagram followers in 3 months organically. Content strategy, posting schedule, engagement tactics.',
      platforms: ['instagram', 'youtube'],
      trending: true,
      tags: ['Instagram', 'Growth', 'Strategy']
    },
    {
      id: 39,
      category: 'marketing',
      title: 'Email Marketing Tips',
      prompt: 'Write email subject lines that get 50%+ open rates. 15 proven formulas with real examples from successful campaigns.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Email', 'Marketing', 'Copywriting']
    },
    {
      id: 40,
      category: 'marketing',
      title: 'Content Calendar',
      prompt: 'My content calendar template that keeps me consistent. Plan a month of content in 2 hours, includes free Notion template.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Content', 'Planning', 'Template']
    },
    {
      id: 41,
      category: 'marketing',
      title: 'Viral Content Formula',
      prompt: 'The psychology behind viral content: 7 triggers that make people share. How to apply these to your posts.',
      platforms: ['twitter', 'linkedin'],
      trending: true,
      tags: ['Viral', 'Content', 'Psychology']
    },
    {
      id: 42,
      category: 'marketing',
      title: 'LinkedIn Strategy',
      prompt: 'LinkedIn personal branding guide: optimize your profile, create engaging posts, and build authority in your niche.',
      platforms: ['linkedin', 'youtube'],
      trending: true,
      tags: ['LinkedIn', 'Branding', 'Strategy']
    },
    {
      id: 43,
      category: 'marketing',
      title: 'SEO Basics',
      prompt: 'SEO for beginners: simple steps to rank on Google without technical knowledge. Focus on content, keywords, and backlinks.',
      platforms: ['linkedin', 'youtube'],
      trending: false,
      tags: ['SEO', 'Google', 'Marketing']
    },
    {
      id: 44,
      category: 'marketing',
      title: 'Influencer Marketing',
      prompt: 'Work with micro-influencers on a small budget. How to find them, pitch collaboration, and measure ROI.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Influencer', 'Marketing', 'Strategy']
    },
    {
      id: 45,
      category: 'marketing',
      title: 'Conversion Optimization',
      prompt: 'Simple tweaks that doubled my website conversion rate. A/B testing results, copywriting tips, and design changes.',
      platforms: ['linkedin', 'twitter'],
      trending: false,
      tags: ['Conversion', 'CRO', 'Website']
    }
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.prompt);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-spark-orange/10 to-spark-pink/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spark-orange to-spark-pink rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Content Templates</h2>
                <p className="text-gray-400 text-sm">Choose a template to get started instantly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, topics, or tags..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spark-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-700 bg-gray-800/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-spark-orange to-spark-pink text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{cat.emoji}</span>
                {cat.name}
                <span className="ml-2 text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-spark-orange/50 transition-all group cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-spark-orange transition-colors flex items-center gap-2">
                      {template.title}
                      {template.trending && (
                        <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Template Description */}
                  <p 
                    className="text-gray-400 text-sm mb-4 overflow-hidden" 
                    style={{ 
                      display: '-webkit-box', 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: 'vertical' 
                    }}
                  >
                    {template.prompt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Platform Icons */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {template.platforms.map((platform, index) => (
                        <span key={index} className="text-xs text-gray-500">
                          {platform === 'instagram' && '📸'}
                          {platform === 'linkedin' && '💼'}
                          {platform === 'twitter' && '🐦'}
                          {platform === 'youtube' && '▶️'}
                        </span>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 text-sm text-spark-orange font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Use Template
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <Sparkles className="w-4 h-4 inline mr-1" />
              {filteredTemplates.length} templates available
            </p>
            <p className="text-xs text-gray-500">
              Click any template to auto-fill your prompt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentTemplates;
import { useState, useEffect } from 'react';
import TopNavBar from '../components/TopNavBar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import FilterTabs from '../components/FilterTabs';
import AccordionCard from '../components/AccordionCard';
import ChatbotWidget from '../components/ChatbotWidget';
import api from '../lib/axios';

export default function Page1_FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs');
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Group FAQs by category and sort by moduleNumber
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Sort categories by moduleNumber and sort questions within each category numerically
  const sortedGroupedFaqs = Object.entries(groupedFaqs)
    .sort(([, a], [, b]) => {
      const moduleA = a[0]?.moduleNumber || 0;
      const moduleB = b[0]?.moduleNumber || 0;
      return moduleA - moduleB;
    })
    .reduce((acc, [category, faqsInCategory]) => {
      // Sort questions by displayNumber (e.g., "13.1", "13.2", "13.10")
      acc[category] = faqsInCategory.sort((a, b) => {
        const [moduleA, qNumA] = (a.displayNumber || '0.0').split('.').map(Number);
        const [moduleB, qNumB] = (b.displayNumber || '0.0').split('.').map(Number);
        
        // First compare module numbers (shouldn't differ within a category, but just in case)
        if (moduleA !== moduleB) return moduleA - moduleB;
        
        // Then compare question numbers numerically
        return qNumA - qNumB;
      });
      return acc;
    }, {});

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col">
      <TopNavBar active="faq" />
      <div className="flex flex-1 relative">
        <Sidebar active="faq" />
        
        <main className="flex-1 w-full max-w-content-max-width mx-auto px-4 md:px-8 py-12 pb-32">
          {/* Hero / Search Section */}
          <section className="mb-12 text-center">
            <h1 className="font-display-lg text-display-lg text-ink-900 mb-4">Find your answer.</h1>
            <p className="font-body-lg text-body-lg text-ink-700 mb-8 max-w-xl mx-auto">
              Search the public knowledge base for immediate answers to common technical inquiries.
            </p>
            
            <SearchBar />
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button className="bg-ink-50 border border-ink-100 text-ink-700 px-3 py-1 rounded-full font-body-sm text-body-sm hover:border-ink-200 hover:bg-ink-100 transition-colors">ViBe Platform</button>
              <button className="bg-ink-50 border border-ink-100 text-ink-700 px-3 py-1 rounded-full font-body-sm text-body-sm hover:border-ink-200 hover:bg-ink-100 transition-colors">NOC Process</button>
              <button className="bg-ink-50 border border-ink-100 text-ink-700 px-3 py-1 rounded-full font-body-sm text-body-sm hover:border-ink-200 hover:bg-ink-100 transition-colors">Offer Letters</button>
              <button className="bg-ink-50 border border-ink-100 text-ink-700 px-3 py-1 rounded-full font-body-sm text-body-sm hover:border-ink-200 hover:bg-ink-100 transition-colors">Deadlines</button>
            </div>
          </section>

          <FilterTabs />

          {/* Content Area (Accordion Cards) */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-10 text-ink-500">Loading FAQs...</div>
            ) : Object.keys(sortedGroupedFaqs).length === 0 ? (
              <div className="text-center py-10 text-ink-500">No FAQs found.</div>
            ) : (
              Object.entries(sortedGroupedFaqs).map(([category, categoryFaqs], idx) => (
                <div key={category} className="mb-10">
                  <h3 className="font-body-lg text-body-lg font-bold text-ink-900 mb-4 flex items-center gap-2" id={categoryFaqs[0].category}>
                    <span className="w-1 h-6 bg-primary rounded-r-sm"></span>
                    {categoryFaqs[0]?.moduleNumber}. {category}
                  </h3>
                  <div className="space-y-3 pl-3">
                    {categoryFaqs.map((faq) => (
                      <AccordionCard 
                        key={faq._id}
                        id={faq._id}
                        title={`${faq.displayNumber} ${faq.question}`}
                        content={faq.answer}
                        helpfulCount={faq.helpfulCount > 0 ? faq.helpfulCount : null}
                        isVerified={faq.resolvedViaEscalation}
                        note={faq.peerFootnote?.approvedByAdmin ? faq.peerFootnote.text : null}
                        sectionId={faq.sectionId}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBriefcase, FaUserTie, FaChartLine, FaRegStar, FaStar } from 'react-icons/fa';

const LandingPage = () => {
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('');
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer at TechCorp",
      content: "Found my dream job in just two weeks! The application process was so smooth.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Manager at InnovateInc",
      content: "We've hired 15 top-quality candidates through this portal. Highly recommended!",
      rating: 4
    },
    {
      name: "David Wilson",
      role: "Marketing Specialist",
      content: "The personalized job recommendations saved me hours of searching.",
      rating: 5
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Jobs" },
    { value: "50,000+", label: "Successful Hires" },
    { value: "5,000+", label: "Companies" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  const jobCategories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Marketing",
    "Design",
    "Engineering",
    "Customer Service"
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchQuery}&location=${locationQuery}`);
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Find Your Dream Job Today</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connecting top talent with the world's most innovative companies.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              className="flex-grow px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Location" 
              className="flex-grow px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 flex items-center justify-center transition"
            >
              <FaSearch className="mr-2" /> Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {jobCategories.slice(0, 6).map(category => (
              <span key={category} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                {category}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-600 mt-2 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <FaUserTie className="text-gray-700 text-3xl" />, title: "For Job Seekers",
                steps: ["Create your profile", "Browse thousands of jobs", "Apply with one click", "Track your applications"],
                buttonText: "Get Started", buttonLink: "/signup"
              },
              {
                icon: <FaBriefcase className="text-gray-700 text-3xl" />, title: "For Employers",
                steps: ["Post your job openings", "Review qualified candidates", "Schedule interviews", "Hire the best talent"],
                buttonText: "Post Jobs", buttonLink: "/signup"
              },
              {
                icon: <FaChartLine className="text-gray-700 text-3xl" />, title: "Why Choose Us",
                steps: ["Advanced matching algorithm", "Simple application process", "Dedicated support team", "Trusted by top companies"],
                buttonText: "Learn More", buttonLink: "/about"
              }
            ].map((card, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-lg shadow text-center hover:shadow-md transition">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-white border border-gray-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{card.title}</h3>
                <ul className="text-left list-disc pl-5 text-gray-600 text-sm space-y-2">
                  {card.steps.map((step, index) => <li key={index}>{step}</li>)}
                </ul>
                <Link to={card.buttonLink} className="mt-6 inline-block bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition">
                  {card.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">What People Say</h2>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`inline-block w-3 h-3 mx-1 rounded-full transition ${activeTestimonial === index ? 'bg-gray-800' : 'bg-gray-400'}`}
                  aria-label={`Testimonial ${index + 1}`}
                />
              ))}
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  i < testimonials[activeTestimonial].rating ?
                    <FaStar key={i} className="text-yellow-500 mx-1" /> :
                    <FaRegStar key={i} className="text-yellow-500 mx-1" />
                ))}
              </div>
              <p className="text-lg italic text-gray-700 mb-4">"{testimonials[activeTestimonial].content}"</p>
              <p className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</p>
              <p className="text-gray-500 text-sm">{testimonials[activeTestimonial].role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take the Next Step?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Join thousands of professionals and companies finding their perfect match.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-8 py-3 rounded-lg font-semibold text-lg">
              Find Jobs
            </Link>
            <Link to="/signup" className="border border-gray-100 hover:bg-gray-100 hover:text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg">
              Post Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">JobPortal</h3>
              <p className="mb-4 text-sm">Connecting talent with opportunity since 2023.</p>
              {/* Add social icons here */}
            </div>
            {[
              {
                title: "For Candidates",
                links: [
                  { to: "/jobs", label: "Browse Jobs" },
                  { to: "/profile", label: "Candidate Profile" },
                  { to: "/applications", label: "My Applications" }
                ]
              },
              {
                title: "For Employers",
                links: [
                  { to: "/post-job", label: "Post a Job" },
                  { to: "/browse-candidates", label: "Browse Candidates" },
                  { to: "/pricing", label: "Pricing Plans" }
                ]
              },
              {
                title: "Company",
                links: [
                  { to: "/about", label: "About Us" },
                  { to: "/contact", label: "Contact" },
                  { to: "/privacy", label: "Privacy Policy" },
                  { to: "/terms", label: "Terms of Service" }
                ]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}><Link to={link.to} className="hover:text-white transition">{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

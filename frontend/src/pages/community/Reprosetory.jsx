import React, { useState } from 'react';
import { Book } from 'lucide-react';

function UniversityRepository() {
    const [activeTab, setActiveTab] = useState('Communities and Collections');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className="font-sans m-0 p-0 bg-white w-full">
            {/* Header */}
            <div className="bg-[#ff6633] text-white py-2.5 px-5 pl-48">
                <div className="max-w-7xl mx-auto">
                    <a href="/" className="text-white">Home</a> &gt; University Repository &gt; Sub-communities & Collections
                </div>
            </div>

            {/* Main Container */}
            <div className="w-full bg-white">
                <div className="max-w-7xl mx-auto p-5 pl-44 pr-44">
                    <h1 className="mt-0 text-2xl font-normal">University Repository</h1>
                    <p className="text-gray-500 text-sm mb-5 mt-2">
                        Permanent link to this repository:
                        <a href="#" className="text-[#ff6633]"> http://mydomain.edu/123456789</a>
                    </p>

                    <div className="border-b border-gray-400 mb-4 "></div>

                    <div className="mt-7">
                        <h2 className="text-3xl ">Browse</h2>

                        {/* Tabs */}
                        <div className="mt-5">
                            {['Communities and Collections', 'By Author', 'By Issue Date', 'By Title', 'By Subject'].map((tab) => (
                                <div
                                    key={tab}
                                    className={`inline-block py-2 px-4 border rounded-t-md mr-1 cursor-pointer ${activeTab === tab
                                            ? 'bg-[#ff6633] text-white border-[#ff6633]'
                                            : 'bg-gray-100 border-gray-300'
                                        }`}
                                    onClick={() => handleTabClick(tab)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Collections View */}
                        <div>
                            {/* Search bar */}
                            <div className="mt-4 flex">
                                <input
                                    type="text"
                                    placeholder="Search the repository..."
                                    className="flex-grow py-2 px-4 border border-gray-300 rounded-l focus:outline-none"
                                />
                                <button className="bg-[#ff6633] text-white py-2 px-4 rounded-r border border-[#ff6633] flex items-center">
                                    <Book className="mr-2" size={18} />
                                    Browse
                                </button>
                            </div>

                            {/* Items count */}
                            <h1 className='text-2xl mt-4'>Collections in this Community</h1>
                            <p className="text-gray-500 text-xs mt-1.5">Items showing 1 - 7 of 7</p>

                            {/* Collections list */}
                            <ul className="mt-5 p-0">
                                {[...Array(7)].map((_, index) => (
                                    <li key={index} className="list-none py-2.5 px-2.5 ">
                                        <a href="#" className="text-[#ff6633] no-underline">
                                            University Repository
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UniversityRepository;
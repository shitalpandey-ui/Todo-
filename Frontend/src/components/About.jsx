import { useState } from "react";

const items = [
  {
    title: "What is this TODO app?",
    body: (
      <>
        <strong>A simple place to plan your day.</strong> Create tasks, mark
        them as done, edit them when plans change, and delete them when you no
        longer need them. Every task is saved to your account, so your list is
        waiting for you whenever you log in.
      </>
    ),
  },
  {
    title: "Key features",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Secure signup and login with session expiry</li>
        <li>Add, edit, complete and delete tasks</li>
        <li>Your tasks are private and tied to your account</li>
        <li>Fast, responsive design that works on phone and desktop</li>
      </ul>
    ),
  },
  {
    title: "How to use it",
    body: (
      <ol className="list-decimal space-y-1 pl-5">
        <li>Create an account or log in.</li>
        <li>Type a task on the home page and press Add.</li>
        <li>Click a task to mark it as completed.</li>
        <li>Use the edit or delete buttons to manage your list.</li>
      </ol>
    ),
  },
  {
    title: "Built with",
    body: (
      <>
        This app uses the <strong>PERN stack</strong>: PostgreSQL for the
        database, Express and Node.js for the backend API, and React with
        Tailwind CSS for the frontend. Authentication uses JWT access and
        refresh tokens.
      </>
    ),
  },
];

export default function About() {
  // index of the open item, or null if all are closed
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="about" className="scroll-mt-14 bg-gray-50 px-4 py-3">
      <div className=" max-w-xl">
        <h1 className=" text-1xl font-bold text-gray-800">About</h1>
        <p className="mb-6 text-gray-600">
          Everything you need to know about our TODO app.
        </p>

        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.title}>
                <h2>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`about-panel-${index}`}
                    className={`flex w-full items-center justify-between px-5 py-4 text-left font-medium transition-colors ${
                      isOpen
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {item.title}
                    <svg
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </h2>

                <div
                  id={`about-panel-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 py-4 text-gray-600">{item.body}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
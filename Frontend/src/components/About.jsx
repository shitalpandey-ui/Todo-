import { useState } from "react";

const items = [
  {
    icon: "💡",
    title: "What is this TODO app?",
    body: (
      <>
        <strong className="text-gray-900">A simple place to plan your day.</strong>{" "}
        Create tasks, mark them as done, edit them when plans change, and
        delete them when you no longer need them. Every task is saved to your
        account, so your list is waiting for you whenever you log in.
      </>
    ),
  },
  {
    icon: "⚡",
    title: "Key features",
    body: (
      <ul className="space-y-2">
        {[
          "Secure signup and login with session expiry",
          "Add, edit, complete and delete tasks",
          "Priorities, due dates, lists and tags",
          "Search, filter and drag to reorder",
          "Responsive design for phone and desktop",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: "🚀",
    title: "How to use it",
    body: (
      <ol className="space-y-2">
        {[
          "Create an account or log in.",
          "Type a task on the home page and press Add.",
          "Use Add details to set a due date, priority, list and tags.",
          "Tick a task when it is done, or use Edit and Delete.",
        ].map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    ),
  },
  {
    icon: "🛠️",
    title: "Built with",
    body: (
      <div className="flex flex-wrap gap-1.5">
        {["PostgreSQL", "Express", "React", "Node.js", "Tailwind CSS", "JWT"].map(
          (tech) => (
            <span
              key={tech}
              className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800"
            >
              {tech}
            </span>
          )
        )}
      </div>
    ),
  },
];

export default function About() {
  // index of the open item, or null if all are closed
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <section id="about" className="scroll-mt-14 px-4 pb-16 pt-6">
      <div className="mx-auto w-full max-w-10xl space-y-6 rounded-2xl bg-gray-50 p-6 shadow-xl sm:p-10">
        <header>
          <h2 className="text-3xl font-semibold text-gray-900">About Taskly</h2>
          <p className="mt-1 text-base text-gray-600">
            Everything you need to know about our TODO app.
          </p>
        </header>

        <div className="grid items-start gap-4 md:grid-cols-2">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.title}
                className={`overflow-hidden rounded-lg border border-l-4 border-gray-200 bg-white transition-colors ${
                  isOpen ? "border-l-teal-600" : "border-l-gray-300 hover:border-l-teal-500"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`about-panel-${index}`}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left font-medium text-gray-900"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-base">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.title}</span>
                    <svg
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-teal-700" : "text-gray-400"
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
                </h3>

                {/* grid-rows trick gives a smooth open/close animation */}
                <div
                  id={`about-panel-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pl-16 text-sm leading-relaxed text-gray-600">
                      {item.body}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">Ready to get things done?</p>
          <button
            type="button"
            onClick={backToTop}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800"
          >
            Back to my tasks
          </button>
        </div>
      </div>
    </section>
  );
}
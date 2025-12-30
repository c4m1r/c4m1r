const folders = [
  { name: 'Inbox', count: 2, active: true },
  { name: 'Drafts', count: 1 },
  { name: 'Outbox', count: 0 },
  { name: 'Sent Items', count: 12 },
  { name: 'Deleted Items', count: 3 },
];

const sampleMessages = [
  {
    id: 1,
    from: 'Admin <admin@c4m1r.dev>',
    subject: 'Welcome to Outlook Express',
    preview: 'This is a simulated inbox for demo purposes...',
    date: 'Today',
    body: `Hello!

This is a demo mailbox. Use it to showcase the Windows XP experience inside the browser.

✔ Double-click messages to see details
✔ Reply and forward buttons are for display only

Enjoy!

- The WebOS team`,
  },
  {
    id: 2,
    from: 'GitHub <noreply@github.com>',
    subject: 'You have new notifications',
    preview: 'A quick reminder to check your latest pull requests and issues.',
    date: 'Yesterday',
    body: `Hi C4m1r,

You have new GitHub notifications waiting for you. Stay productive and keep your projects in sync!`,
  },
];

export function OutlookExpress() {
  const activeMessage = sampleMessages[0];

  return (
    <div className="flex h-full w-full bg-[#f3f3f3] text-xs font-tahoma text-[#1f1f1f] select-none">
      <aside className="w-48 bg-[#d7e4f7] border-r border-[#9cb2cf] flex flex-col">
        <header className="px-3 py-2 border-b border-[#9cb2cf] bg-gradient-to-r from-[#1b4fa3] to-[#3c73d8] text-white text-[12px] font-semibold">
          Outlook Shortcuts
        </header>
        <div className="flex-1 overflow-auto py-2">
          <div className="px-3 pb-2 text-[11px] text-[#1b4fa3] font-semibold uppercase">
            Mail
          </div>
          <ul className="flex flex-col">
            {folders.map((folder) => (
              <li
                key={folder.name}
                className={`px-3 py-1 flex items-center justify-between ${
                  folder.active
                    ? 'bg-[#1b4fa3] text-white font-semibold'
                    : 'hover:bg-[#e6efff] text-[#1b4fa3]'
                }`}
              >
                <span>{folder.name}</span>
                {folder.count !== undefined && (
                  <span
                    className={`px-1 text-[10px] rounded ${
                      folder.active ? 'bg-[#335fa3]' : 'bg-white text-[#1b4fa3]'
                    }`}
                  >
                    {folder.count}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-white to-[#e9f1ff] border-b border-[#c2d3e8] text-[11px] text-[#1b4fa3]">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Inbox</span>
            <span>(Local Folders)</span>
          </div>
          <div className="flex items-center gap-2 text-[#0f3469]">
            <button className="px-2 py-1 bg-white border border-[#9cb2cf] rounded hover:bg-[#dfe9ff]">
              New Mail
            </button>
            <button className="px-2 py-1 bg-white border border-[#9cb2cf] rounded hover:bg-[#dfe9ff]">
              Reply
            </button>
            <button className="px-2 py-1 bg-white border border-[#9cb2cf] rounded hover:bg-[#dfe9ff]">
              Forward
            </button>
          </div>
        </header>

        <section className="border-b border-[#c2d3e8] bg-white flex items-center px-3 py-1 text-[11px] text-[#1b4fa3] uppercase tracking-wide">
          <span className="w-6">!</span>
          <span className="flex-1">From</span>
          <span className="flex-1">Subject</span>
          <span className="w-24 text-right">Received</span>
        </section>

        <section className="bg-white border-b border-[#c2d3e8] h-32 overflow-auto">
          {sampleMessages.map((message) => (
            <article
              key={message.id}
              className={`flex items-center px-3 py-2 text-[11px] border-b border-[#edf3ff] ${
                message.id === activeMessage.id ? 'bg-[#dfe9ff]' : 'hover:bg-[#f6f9ff]'
              }`}
            >
              <span className="w-6 text-[#1b4fa3]">{message.id === 1 ? '•' : ''}</span>
              <span className="flex-1 font-semibold">{message.from}</span>
              <span className="flex-1 text-[#305ca8]">{message.subject}</span>
              <span className="w-24 text-right text-[#305ca8]">{message.date}</span>
            </article>
          ))}
        </section>

        <section className="flex-1 bg-white px-4 py-3 overflow-auto text-[11px] leading-5 text-[#1f1f1f]">
          <header className="border-b border-[#c2d3e8] pb-2 mb-3">
            <div className="flex items-center gap-2 text-[#1b4fa3]">
              <span className="font-semibold uppercase">From:</span>
              <span>{activeMessage.from}</span>
            </div>
            <div className="flex items-center gap-2 text-[#1b4fa3]">
              <span className="font-semibold uppercase">Subject:</span>
              <span>{activeMessage.subject}</span>
            </div>
            <div className="flex items-center gap-2 text-[#1b4fa3]">
              <span className="font-semibold uppercase">Sent:</span>
              <span>{activeMessage.date}</span>
            </div>
          </header>
          <pre className="whitespace-pre-wrap font-sans text-[#1f1f1f] bg-[#f6f9ff] border border-[#c2d3e8] px-3 py-2 rounded">
            {activeMessage.body}
          </pre>
        </section>

        <footer className="px-3 py-2 bg-[#d7e4f7] border-t border-[#9cb2cf] text-[10px] text-[#1b4fa3] flex items-center justify-between">
          <span>Folder size: 1.3 MB</span>
          <span>Last checked: just now (simulated)</span>
        </footer>
      </main>
    </div>
  );
}


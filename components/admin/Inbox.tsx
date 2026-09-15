import { markMessage, removeMessage, removeSubscriber } from "@/app/admin/actions";
import { formatPhone, type Message, type Subscriber } from "@/lib/inbox";
import { btn, card } from "./ui";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Detroit",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function MessagesInbox({
  messages,
  storeReady,
  emailReady,
}: {
  messages: Message[];
  storeReady: boolean;
  emailReady: boolean;
}) {
  const unread = messages.filter((m) => !m.read).length;
  return (
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-brand text-olive">Messages</h2>
          <p className="mt-1 text-sm text-stone-warm">
            Sent from the Contact page. {unread > 0 ? `${unread} unread.` : "All caught up."}
          </p>
        </div>
        {messages.length > 0 && (
          <a href="/admin/export?kind=messages" className={btn.secondary}>
            Download spreadsheet
          </a>
        )}
      </div>

      {!emailReady && storeReady && (
        <p className="mt-4 rounded border border-gold/50 bg-cream px-4 py-3 text-xs text-stone-warm">
          Email alerts are off. Set <code>RESEND_API_KEY</code> and{" "}
          <code>ALERT_EMAIL</code> in Vercel to get an email for each new message.
        </p>
      )}

      {messages.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-beige px-4 py-8 text-center text-sm text-stone-warm">
          {storeReady ? "No messages yet." : "Messages will appear here once storage is connected."}
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded border p-4 ${
                m.read ? "border-beige/70 bg-white" : "border-gold/60 bg-cream"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange align-middle" aria-label="Unread" />}
                  {m.name}{" "}
                  <a href={`mailto:${m.email}`} className="text-sm font-normal text-stone-warm underline">
                    {m.email}
                  </a>
                </p>
                <span className="text-xs text-stone-warm/80">{when(m.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Marijuana Land")}`}
                  className={btn.subtle}
                >
                  Reply by email
                </a>
                <form action={markMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="read" value={m.read ? "0" : "1"} />
                  <button type="submit" className={btn.subtle}>
                    {m.read ? "Mark unread" : "Mark as read"}
                  </button>
                </form>
                <form action={removeMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className={btn.danger}>
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SubscribersList({
  subscribers,
  storeReady,
}: {
  subscribers: Subscriber[];
  storeReady: boolean;
}) {
  return (
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-brand text-olive">Deal-list signups</h2>
          <p className="mt-1 text-sm text-stone-warm">
            People who signed up for text deals through the popup. {subscribers.length} total.
          </p>
        </div>
        {subscribers.length > 0 && (
          <a href="/admin/export?kind=subscribers" className={btn.secondary}>
            Download spreadsheet
          </a>
        )}
      </div>

      {subscribers.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-beige px-4 py-8 text-center text-sm text-stone-warm">
          {storeReady ? "No signups yet." : "Signups will appear here once storage is connected."}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige text-left text-xs uppercase tracking-brand text-stone-warm">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Signed up</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-beige/50">
                  <td className="py-2 pr-4 font-semibold">{s.name}</td>
                  <td className="py-2 pr-4">
                    <a href={`sms:+1${s.phone}`} className="underline">{formatPhone(s.phone)}</a>
                  </td>
                  <td className="py-2 pr-4 text-stone-warm">{when(s.created_at)}</td>
                  <td className="py-2 text-right">
                    <form action={removeSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className={btn.danger}>Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

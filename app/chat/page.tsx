'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'customer' | 'merchant' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  avatar: string;
}

interface Conversation {
  id: string;
  customerName: string;
  customerId: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  avatar: string;
  status: 'online' | 'offline';
}

const AVATARS = ['👩','👩‍🦰','👩‍🦱','👨','👨‍🦱','🧑','👱‍♀️','👱'];
const MERCHANT_AVATAR = '🏪';
const SYSTEM_AVATAR = '🤖';

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getAvatar(name: string) {
  return AVATARS[Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATARS.length];
}

// 历史消息存储（localStorage）
function loadMessages(conversationId: string): Message[] {
  try {
    const saved = localStorage.getItem(`chat_${conversationId}`);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}
function saveMessages(conversationId: string, msgs: Message[]) {
  localStorage.setItem(`chat_${conversationId}`, JSON.stringify(msgs));
}
function loadConversations(): Conversation[] {
  try {
    const saved = localStorage.getItem('chat_conversations');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', customerName: '张美琳', customerId: 'u1', lastMessage: '请问今天的预约可以改到下午吗？', lastTime: new Date(Date.now()-1800000).toISOString(), unread: 2, avatar: '👩', status: 'online' },
      { id: 'c2', customerName: '李女士', customerId: 'u2', lastMessage: '好的谢谢，我明天来取', lastTime: new Date(Date.now()-7200000).toISOString(), unread: 0, avatar: '👩‍🦰', status: 'offline' },
      { id: 'c3', customerName: '王小姐', customerId: 'u3', lastMessage: '推荐什么护肤品适合我这种肤质？', lastTime: new Date(Date.now()-86400000).toISOString(), unread: 1, avatar: '👩‍🦱', status: 'online' },
    ];
  } catch { return []; }
}
function saveConversations(convs: Conversation[]) {
  localStorage.setItem('chat_conversations', JSON.stringify(convs));
}

export default function ChatPage() {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setView('chat');
    const msgs = loadMessages(conv.id);
    // 如果是新对话，加载欢迎消息
    if (msgs.length === 0) {
      const welcome: Message = {
        id: Date.now().toString(), sender: 'system', senderName: '系统',
        content: `欢迎 ${conv.customerName}！我是丽姿秀美容工作室的客服。请问有什么可以帮您？`,
        timestamp: new Date().toISOString(), avatar: SYSTEM_AVATAR,
      };
      const welcomeMsg: Message[] = [welcome];
      saveMessages(conv.id, welcomeMsg);
      setMessages(welcomeMsg);
    } else {
      setMessages(msgs);
    }
    // 清除未读
    setConversations(prev => {
      const updated = prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c);
      saveConversations(updated);
      return updated;
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    const text = input.trim();
    setInput('');

    const newMsg: Message = {
      id: Date.now().toString(), sender: 'merchant', senderName: '商家客服',
      content: text, timestamp: new Date().toISOString(), avatar: MERCHANT_AVATAR,
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(activeConv.id, updated);

    // 更新会话列表
    setConversations(prev => {
      const updated = prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: text, lastTime: new Date().toISOString() } : c);
      saveConversations(updated);
      return updated;
    });

    // 自动回复
    if (autoReply) {
      const delay = 1500 + Math.random() * 2000;
      const autoMsg = generateAutoReply(text, activeConv.customerName);
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(), sender: 'customer', senderName: activeConv.customerName,
          content: autoMsg, timestamp: new Date().toISOString(), avatar: activeConv.avatar,
        };
        setMessages(prev => {
          const next = [...prev, reply];
          saveMessages(activeConv.id, next);
          // 更新会话列表
          setConversations(cprev => {
            const cupdated = cprev.map(c => c.id === activeConv.id ? { ...c, lastMessage: autoMsg, lastTime: new Date().toISOString(), unread: c.id === activeConv.id ? c.unread : c.unread + 1 } : c);
            saveConversations(cupdated);
            return cupdated;
          });
          return next;
        });
      }, delay);
    }

    inputRef.current?.focus();
  };

  const filtered = conversations.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💬 客服中心</h1>
          <p className="text-gray-500 mt-1">实时处理客户咨询</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={autoReply} onChange={e => setAutoReply(e.target.checked)}
              className="w-4 h-4 accent-pink-500" />
            🤖 自动回复（演示模式）
          </label>
          {totalUnread > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
              {totalUnread} 条未读
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
        {view === 'list' ? (
          <div className="flex flex-col h-full">
            {/* 搜索栏 */}
            <div className="p-4 border-b">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 搜索客户姓名..."
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>

            {/* 对话列表 */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-4">💬</div><p>暂无对话记录</p></div>
              ) : filtered.map(conv => (
                <div key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="flex items-center gap-4 px-6 py-4 border-b hover:bg-pink-50 cursor-pointer transition">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                      {conv.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${conv.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-gray-900 ${conv.unread > 0 ? 'text-pink-600' : ''}`}>{conv.customerName}</span>
                      <span className="text-xs text-gray-400">{formatTime(conv.lastTime)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* 聊天头部 */}
            <div className="flex items-center gap-4 px-6 py-4 border-b bg-white">
              <button onClick={() => setView('list')} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg transition">←</button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{activeConv?.avatar}</div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${activeConv?.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{activeConv?.customerName}</div>
                <div className="text-xs text-gray-500">{activeConv?.status === 'online' ? '🟢 在线' : '⚪ 离线'}</div>
              </div>
              <div className="text-sm text-gray-500">
                {messages.length} 条消息
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.sender === 'system' ? (
                    <div className="text-center">
                      <div className="inline-block bg-gray-200 text-gray-600 text-xs px-4 py-1.5 rounded-full">{msg.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatTime(msg.timestamp)}</div>
                    </div>
                  ) : (
                    <div className={`flex items-end gap-3 ${msg.sender === 'merchant' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{msg.avatar}</div>
                      <div className={`max-w-xs lg:max-w-md ${msg.sender === 'merchant' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm ${msg.sender === 'merchant' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'}`}>
                          {msg.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 px-1">{msg.senderName} · {formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* 输入框 */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
                  rows={2}
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="flex flex-col gap-2">
                  <button onClick={sendMessage} disabled={!input.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40 text-sm">
                    发送
                  </button>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Enter 发送 · Shift+Enter 换行</span>
                {autoReply && <span>🤖 自动回复已开启</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function generateAutoReply(userMessage: string, customerName: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('预约') || lower.includes('时间') || lower.includes('改')) {
    return `好的${customerName}，请问您想改到哪个时间段呢？我们今天的预约情况如下：\n09:00-10:00 可预约\n14:00-15:00 可预约\n16:30-17:30 可预约`;
  }
  if (lower.includes('价') || lower.includes('多少钱') || lower.includes('价格')) {
    return `我们提供多种服务套餐：\n🌸 基础面部护理：¥288/60分钟\n💆 深层清洁焕肤：¥488/90分钟\n✨ 全身精油SPA：¥688/120分钟\n\n具体价格取决于您的肤质和需求，欢迎到店体验！`;
  }
  if (lower.includes('产品') || lower.includes('商品') || lower.includes('买')) {
    return `我们商城的护肤品都是精选品牌，适合各种肤质！您可以在网站「产品商店」页面查看，也可以告诉我您的肤质类型，我帮您推荐～`;
  }
  if (lower.includes('谢谢') || lower.includes('好的') || lower.includes('知道了')) {
    return `不客气！很高兴能帮到您 😊 如有其他问题随时联系我！`;
  }
  if (lower.includes('地址') || lower.includes('在哪') || lower.includes('位置')) {
    return `📍 丽姿秀美容工作室\n朝阳区建国路88号SOHO现代城A座1201\n🕐 营业时间：09:00-20:00（周一至周日）\n☎️ 联系电话：138-8888-8888`;
  }
  const replies = [
    `收到您的消息了！我这边帮您记录一下，稍后给您回复 😊`,
    `好的，我来帮您处理这个问题，请稍等片刻～`,
    `感谢您的咨询！我们的美容师团队会尽快为您安排。请问您方便告诉我更多细节吗？`,
    `明白！请问您大概什么时候方便到店呢？我帮您预约一个合适的时间~`,
    `好的，我这边帮您查询一下。我们的营业时间是每天 09:00-20:00，欢迎预约！`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

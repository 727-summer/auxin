"use client"; 

import { useState, useRef } from 'react';

export default function Page() {
  // ================= 状态管理 =================
  const [step, setStep] = useState('verify'); 
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState(false);
  const [currentTab, setCurrentTab] = useState('intro');
  const [role, setRole] = useState('guest'); 
  
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. 留言功能
  const [msgName, setMsgName] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgImage, setMsgImage] = useState(null);
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qixin_messages');
      if (saved) return JSON.parse(saved);
    }
    return [{ name: '系统提示', text: '欢迎来到留言区！', img: null }];
  });

  // 2. 小鸡的线下
  const [offlineDate, setOfflineDate] = useState('');
  const [offlineText, setOfflineText] = useState('');
  const [offlineImage, setOfflineImage] = useState(null);
  const [offlinePosts, setOfflinePosts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qixin_offline');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // 3. 爱情之路
  const [timelineData, setTimelineData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qixin_timeline');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 1, date: "2017年6月15日", title: "相识", img: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80", desc: "这一天，两个少年在公司第一次相遇，命运的齿轮开始转动。" }
    ];
  });
  const [newTimelineDate, setNewTimelineDate] = useState('');
  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [newTimelineDesc, setNewTimelineDesc] = useState('');
  const [newTimelineImage, setNewTimelineImage] = useState(null);
  const [editingTimelineId, setEditingTimelineId] = useState(null);

  // 4. 升级：合作music (用链接永久保存)
  const [musicLink, setMusicLink] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('qixin_music_link') || '';
    return '';
  });
  const [isEditingMusic, setIsEditingMusic] = useState(false);
  const [tempMusicLink, setTempMusicLink] = useState('');

  // 5. 升级：舞台视频 (用链接永久保存)
  const [videoLink, setVideoLink] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('qixin_video_link') || '';
    return '';
  });
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [tempVideoLink, setTempVideoLink] = useState('');

  // 默契问答
  const quizData = [
    { q: "马嘉祺和丁程鑫，谁的年龄更大？", options: ["马嘉祺", "丁程鑫", "一样大"], answer: 0 },
    { q: "丁程鑫的粉丝名叫什么？", options: ["小气球", "比邻星", "满月"], answer: 1 }
  ];
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);

  // 扑克 & UNO & 宠物
  const [playerCard, setPlayerCard] = useState({ v: '?', s: '', color: '' });
  const [cpuCard, setCpuCard] = useState({ v: '?', s: '', color: '' });
  const [pokerResult, setPokerResult] = useState('点击抽牌');
  const [unoPlayerCard, setUnoPlayerCard] = useState({ value: '?', color: 'gray' });
  const [unoCpuCard, setUnoCpuCard] = useState({ value: '?', color: 'gray' });
  const [unoResult, setUnoResult] = useState('点击下方按钮开始抽牌！');
  const [hunger, setHunger] = useState(50);
  const [petIndex, setPetIndex] = useState(0);
  const pets = [
    { name: "柴小祺", img: "/chaixiaoqi.jpg" },
    { name: "鸡小七", img: "/jixiaoqi.jpg" },
    { name: "狐小鑫", img: "/huxiaoxin.jpg" },
    { name: "鸡小星", img: "/jixiaoxing.jpg" }
  ];

  // ================= 逻辑函数 =================
  const tryPlayMusic = () => {
    if (audioRef.current) audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleVerify = () => {
    const ans = verifyInput.trim();
    if (ans === '马嘉祺丁程鑫楼金婚') {
      setRole('admin'); setStep('welcome'); setVerifyError(false); tryPlayMusic();
    } else if (ans === '马嘉祺丁程鑫') {
      setRole('guest'); setStep('welcome'); setVerifyError(false); tryPlayMusic();
    } else {
      setVerifyError(true);
    }
  };

  const handleAccept = () => { setStep('app'); tryPlayMusic(); };

  const toggleMusic = () => {
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const handleImageUpload = (e, setImg) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImg(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // --- 保存链接逻辑 ---
  const saveMusicLink = () => {
    setMusicLink(tempMusicLink);
    localStorage.setItem('qixin_music_link', tempMusicLink);
    setIsEditingMusic(false);
  };

  const saveVideoLink = () => {
    setVideoLink(tempVideoLink);
    localStorage.setItem('qixin_video_link', tempVideoLink);
    setIsEditingVideo(false);
  };

  // --- 其他保存逻辑 ---
  const handleAddTimeline = () => {
    if (!newTimelineDate) return;
    const newItem = { id: Date.now(), date: newTimelineDate, title: newTimelineTitle || '新的节点', img: newTimelineImage, desc: newTimelineDesc };
    const updated = [...timelineData, newItem];
    setTimelineData(updated); localStorage.setItem('qixin_timeline', JSON.stringify(updated));
    setNewTimelineDate(''); setNewTimelineTitle(''); setNewTimelineDesc(''); setNewTimelineImage(null);
  };

  const saveTimelineData = (id, newDate, newTitle, newImg, newDesc) => {
    const updated = timelineData.map(item => item.id === id ? { ...item, date: newDate, title: newTitle, img: newImg, desc: newDesc } : item);
    setTimelineData(updated); localStorage.setItem('qixin_timeline', JSON.stringify(updated));
    setEditingTimelineId(null);
  };

  const handleMessageSubmit = () => {
    if (!msgText && !msgImage) return;
    const newMessages = [{ name: msgName || '匿名', text: msgText, img: msgImage }, ...messages];
    setMessages(newMessages); localStorage.setItem('qixin_messages', JSON.stringify(newMessages));
    setMsgText(''); setMsgImage(null); setMsgName('');
  };

  const handleOfflineSubmit = () => {
    if (!offlineText && !offlineImage) return;
    const newPosts = [{ date: offlineDate || '未填日期', text: offlineText, img: offlineImage }, ...offlinePosts];
    setOfflinePosts(newPosts); localStorage.setItem('qixin_offline', JSON.stringify(newPosts));
    setOfflineText(''); setOfflineDate(''); setOfflineImage(null);
  };

  // ================= 样式 =================
  const styles = {
    body: { background: 'linear-gradient(135deg, #e8d8ff 0%, #fff8d6 100%)', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' },
    box: { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(122, 66, 201, 0.2)', maxWidth: '400px', margin: '100px auto', textAlign: 'center' },
    input: { width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' },
    btn: { width: '100%', padding: '10px', background: '#7a42c9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    nav: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
    navItem: (isActive) => ({ background: isActive ? 'linear-gradient(90deg, #f4eeff, #fff8d6)' : 'rgba(255,255,255,0.7)', color: isActive ? '#7a42c9' : '#555', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: isActive ? 'bold' : 'normal', border: isActive ? '2px solid #7a42c9' : '1px solid transparent' }),
    card: { background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '20px', maxWidth: '800px', margin: '0 auto', minHeight: '500px' },
    title: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
    introCont: { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' },
    profile: (bgColor, borderColor) => ({ flex: 1, minWidth: '300px', background: bgColor, border: `2px solid ${borderColor}`, borderRadius: '12px', padding: '20px' }),
    img: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '8px', border: '4px solid white', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    timelineItem: { padding: '15px', background: 'white', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' },
    musicBtn: { position: 'fixed', bottom: '20px', right: '20px', width: '50px', height: '50px', borderRadius: '50%', background: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  };

  // ================= 页面渲染 =================
  return (
    <>
      <audio ref={audioRef} loop src="/music.mp3" />
      
      {step === 'verify' && (
        <div style={styles.body}>
          <div style={styles.box}>
            <h2 style={{ color: '#7a42c9', marginBottom: '20px', fontSize: '20px' }}>楼婚一是？</h2>
            <input style={styles.input} value={verifyInput} onChange={(e) => setVerifyInput(e.target.value)} placeholder="输入答案" />
            <button style={styles.btn} onClick={handleVerify}>提交验证</button>
            {verifyError && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>答案错误，请重新输入！</p>}
          </div>
        </div>
      )}

      {step === 'welcome' && (
        <div style={styles.body}>
          <div style={styles.box}>
            <h2 style={{ color: '#7a42c9', marginBottom: '20px', fontSize: '20px' }}>欢迎七芒星打开马嘉祺丁程鑫的爱情手册</h2>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ ...styles.btn, width: '100px', background: '#eee', color: '#333' }} onClick={() => setStep('verify')}>No</button>
              <button style={{ ...styles.btn, width: '100px' }} onClick={handleAccept}>Yes 💛</button>
            </div>
          </div>
        </div>
      )}

      {step === 'app' && (
        <div style={styles.body}>
          <button style={styles.musicBtn} onClick={toggleMusic}>{isPlaying ? '⏸️' : '🎵'}</button>

          <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            <span style={{ color: '#7a42c9' }}>马嘉祺</span>
            <span style={{ color: '#d4a017' }}>丁程鑫</span>
            <span style={{ background: 'linear-gradient(90deg, #7a42c9, #d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>的爱情手册</span>
          </h1>
          <p style={{ textAlign: 'center', color: '#d4a017', fontWeight: 'bold', marginBottom: '20px' }}>(风年工作室)</p>

          <div style={styles.nav}>
            {['intro', 'timeline', 'offline', 'message', 'quiz', 'poker', 'pet', 'music', 'video', 'uno'].map(tab => (
              <div key={tab} style={styles.navItem(currentTab === tab)} onClick={() => setCurrentTab(tab)}>
                {{ intro: '简介', timeline: '爱情之路', offline: '小鸡的线下', message: '七芒星留言区', quiz: '默契问答', poker: '扑克牌', pet: '柴狐基地', music: '合作music', video: '舞台视频', uno: 'UNO牌' }[tab]}
              </div>
            ))}
          </div>

          <div style={styles.card}>
            
            {/* 1. 简介 */}
            {currentTab === 'intro' && (
              <div>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>双人</span><span style={{ color: '#d4a017' }}>简介</span></h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '15px', lineHeight: '1.8' }}>
                  <span style={{ color: '#7a42c9', fontWeight: 'bold' }}>马嘉祺</span>与<span style={{ color: '#d4a017', fontWeight: 'bold' }}>丁程鑫</span>，从练习室的初识到舞台上的并肩。命运将他们紧紧相连，跨越风雨，共同谱写属于风年的浪漫篇章。
                </p>
                <div style={styles.introCont}>
                  <div style={styles.profile('#f4eeff', '#e0d4f5')}>
                    <img src="/majiaqi.png" style={styles.img} alt="马嘉祺" />
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}><b>姓名：</b>马嘉祺</div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}><b>生日：</b>2002年12月12日</div>
                  </div>
                  <div style={styles.profile('#fff9e6', '#fcecb0')}>
                    <img src="/dingchengxin.png" style={styles.img} alt="丁程鑫" />
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}><b>姓名：</b>丁程鑫</div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}><b>生日：</b>2002年2月24日</div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 爱情之路 */}
            {currentTab === 'timeline' && (
              <div>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>爱情</span><span style={{ color: '#d4a017' }}>之路</span></h2>
                <div style={{ background: '#fcf9ff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed #7a42c9' }}>
                  <h3 style={{ color: '#7a42c9', marginBottom: '15px', fontSize: '16px' }}>✨ 添加新的时间节点</h3>
                  <input style={styles.input} value={newTimelineDate} onChange={e => setNewTimelineDate(e.target.value)} placeholder="日期 (如：2023年8月20日)" />
                  <input style={styles.input} value={newTimelineTitle} onChange={e => setNewTimelineTitle(e.target.value)} placeholder="标题 (如：演唱会并肩)" />
                  <textarea style={{ ...styles.input, height: '80px', resize: 'none' }} value={newTimelineDesc} onChange={e => setNewTimelineDesc(e.target.value)} placeholder="写下这天的故事..." />
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ cursor: 'pointer', color: '#7a42c9', padding: '10px', border: '1px dashed #7a42c9', borderRadius: '8px', background: 'white' }}>
                      📷 上传照片
                      <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setNewTimelineImage)} />
                    </label>
                    {newTimelineImage && <img src={newTimelineImage} style={{ height: '40px', marginLeft: '15px', borderRadius: '4px' }} alt="预览" />}
                  </div>
                  <button style={styles.btn} onClick={handleAddTimeline}>发布并保存节点</button>
                </div>

                {timelineData.map((item) => (
                  <div key={item.id} style={styles.timelineItem}>
                    {editingTimelineId === item.id ? (
                      <div>
                        <input style={styles.input} defaultValue={item.date} onChange={(e) => item.newDate = e.target.value} placeholder="日期" />
                        <input style={styles.input} defaultValue={item.title} onChange={(e) => item.newTitle = e.target.value} placeholder="标题" />
                        <input style={styles.input} defaultValue={item.img} onChange={(e) => item.newImg = e.target.value} placeholder="网络图片网址 (可选)" />
                        <textarea style={{ ...styles.input, height: '80px' }} defaultValue={item.desc} onChange={(e) => item.newDesc = e.target.value} placeholder="文字描述" />
                        <button style={styles.btn} onClick={() => saveTimelineData(item.id, item.newDate || item.date, item.newTitle || item.title, item.newImg || item.img, item.newDesc || item.desc)}>保存修改</button>
                        <button style={{ ...styles.btn, background: '#ccc', marginTop: '10px' }} onClick={() => setEditingTimelineId(null)}>取消</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ color: '#7a42c9', fontWeight: 'bold', fontSize: '18px' }}>{item.date} - {item.title}</div>
                          <button onClick={() => setEditingTimelineId(item.id)} style={{ background: '#f4eeff', color: '#7a42c9', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✏️ 修改</button>
                        </div>
                        {item.img && <img src={item.img} style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', marginBottom: '10px' }} alt="照片" />}
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 3. 小鸡的线下 */}
            {currentTab === 'offline' && (
              <div>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>小鸡的</span><span style={{ color: '#d4a017' }}>线下</span></h2>
                <div style={{ background: '#fcf9ff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed #7a42c9' }}>
                  <input style={styles.input} value={offlineDate} onChange={e => setOfflineDate(e.target.value)} placeholder="日期" />
                  <textarea style={{ ...styles.input, height: '80px', resize: 'none' }} value={offlineText} onChange={e => setOfflineText(e.target.value)} placeholder="写点什么..." />
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ cursor: 'pointer', color: '#7a42c9', padding: '10px', border: '1px dashed #7a42c9', borderRadius: '8px', background: 'white' }}>
                      📷 选择本地照片
                      <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setOfflineImage)} />
                    </label>
                    {offlineImage && <img src={offlineImage} style={{ height: '40px', marginLeft: '15px', borderRadius: '4px' }} alt="预览" />}
                  </div>
                  <button style={styles.btn} onClick={handleOfflineSubmit}>发布并保存</button>
                </div>
                <div>
                  {offlinePosts.map((post, i) => (
                    <div key={i} style={{ background: '#fff', padding: '15px', borderLeft: '4px solid #d4a017', marginBottom: '10px', borderRadius: '8px' }}>
                      <div style={{ color: '#7a42c9', fontWeight: 'bold', marginBottom: '8px' }}>{post.date}</div>
                      <p style={{ marginBottom: '10px' }}>{post.text}</p>
                      {post.img && <img src={post.img} style={{ maxWidth: '150px', borderRadius: '8px' }} alt="线下照片" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 留言板 */}
            {currentTab === 'message' && (
              <div>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>想对</span><span style={{ color: '#d4a017' }}>嘉祺程鑫</span><span style={{ color: '#7a42c9' }}>说什么？</span></h2>
                <input style={styles.input} value={msgName} onChange={e => setMsgName(e.target.value)} placeholder="你的昵称" />
                <textarea style={{ ...styles.input, height: '100px', resize: 'none' }} value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="写下你的留言..." />
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer', color: '#7a42c9', padding: '10px', border: '1px dashed #7a42c9', borderRadius: '8px' }}>
                    📷 插入照片
                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setMsgImage)} />
                  </label>
                  {msgImage && <img src={msgImage} style={{ height: '40px', marginLeft: '15px', borderRadius: '4px' }} alt="预览" />}
                </div>
                <button style={styles.btn} onClick={handleMessageSubmit}>发射留言</button>
                <div style={{ marginTop: '20px' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ background: '#fff', padding: '15px', borderLeft: '4px solid #f2c94c', marginBottom: '10px', borderRadius: '8px' }}>
                      <b>{m.name}：</b><p style={{ marginTop: '5px' }}>{m.text}</p>
                      {m.img && <img src={m.img} style={{ maxWidth: '150px', borderRadius: '8px', marginTop: '10px' }} alt="留言图片" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. 合作music (用链接永久保存) */}
            {currentTab === 'music' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>合作</span><span style={{ color: '#d4a017' }}>music</span></h2>
                
                {role === 'admin' && (
                  <div style={{ marginBottom: '20px' }}>
                    {isEditingMusic ? (
                      <div style={{ padding: '15px', background: '#fcf9ff', borderRadius: '10px' }}>
                        <input style={styles.input} value={tempMusicLink} onChange={e => setTempMusicLink(e.target.value)} placeholder="粘贴网易云/QQ音乐的网页链接" />
                        <button style={styles.btn} onClick={saveMusicLink}>保存链接</button>
                        <button style={{ ...styles.btn, background: '#ccc', marginTop: '10px' }} onClick={() => setIsEditingMusic(false)}>取消</button>
                      </div>
                    ) : (
                      <button style={{ ...styles.btn, width: '200px', margin: '0 auto' }} onClick={() => { setIsEditingMusic(true); setTempMusicLink(musicLink); }}>
                        ✏️ 管理员填入/修改音乐链接
                      </button>
                    )}
                  </div>
                )}

                {musicLink ? (
                  <div style={{ padding: '20px', background: '#f4eeff', borderRadius: '10px', display: 'inline-block', width: '100%', maxWidth: '400px' }}>
                    <p style={{ color: '#7a42c9', fontWeight: 'bold', marginBottom: '10px' }}>🎵 点击下方跳转收听</p>
                    <a href={musicLink} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '15px', background: '#7a42c9', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                      前往音乐平台收听
                    </a>
                  </div>
                ) : (
                  <p style={{ marginTop: '20px', color: '#888' }}>暂无音乐链接，请管理员填入。</p>
                )}
              </div>
            )}

            {/* 6. 舞台视频 (用链接永久保存) */}
            {currentTab === 'video' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>舞台</span><span style={{ color: '#d4a017' }}>视频</span></h2>
                
                {role === 'admin' && (
                  <div style={{ marginBottom: '20px' }}>
                    {isEditingVideo ? (
                      <div style={{ padding: '15px', background: '#fcf9ff', borderRadius: '10px' }}>
                        <input style={styles.input} value={tempVideoLink} onChange={e => setTempVideoLink(e.target.value)} placeholder="粘贴B站/腾讯视频的网页链接" />
                        <button style={styles.btn} onClick={saveVideoLink}>保存链接</button>
                        <button style={{ ...styles.btn, background: '#ccc', marginTop: '10px' }} onClick={() => setIsEditingVideo(false)}>取消</button>
                      </div>
                    ) : (
                      <button style={{ ...styles.btn, width: '200px', margin: '0 auto' }} onClick={() => { setIsEditingVideo(true); setTempVideoLink(videoLink); }}>
                        ✏️ 管理员填入/修改视频链接
                      </button>
                    )}
                  </div>
                )}

                {videoLink ? (
                  <div style={{ padding: '20px', background: '#f4eeff', borderRadius: '10px', display: 'inline-block', width: '100%', maxWidth: '400px' }}>
                    <p style={{ color: '#7a42c9', fontWeight: 'bold', marginBottom: '10px' }}>📺 点击下方跳转观看</p>
                    <a href={videoLink} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '15px', background: '#d4a017', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                      前往视频平台观看
                    </a>
                  </div>
                ) : (
                  <p style={{ marginTop: '20px', color: '#888' }}>暂无视频链接，请管理员填入。</p>
                )}
              </div>
            )}

            {/* 7. UNO牌 */}
            {currentTab === 'uno' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>UNO</span><span style={{ color: '#d4a017' }}>牌</span></h2>
                <p style={{ color: '#888', marginBottom: '20px' }}>点击抽牌，比比谁的牌更大！</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '30px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>你的牌</span>
                    <div style={{ width: '100px', height: '140px', background: unoPlayerCard.color === 'wild' ? 'linear-gradient(45deg, red, yellow, green, blue)' : unoPlayerCard.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', marginTop: '10px', border: '4px solid white' }}>
                      {unoPlayerCard.value}
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7a42c9', display: 'flex', alignItems: 'center' }}>VS</div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>电脑牌</span>
                    <div style={{ width: '100px', height: '140px', background: unoCpuCard.color === 'wild' ? 'linear-gradient(45deg, red, yellow, green, blue)' : unoCpuCard.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', marginTop: '10px', border: '4px solid white' }}>
                      {unoCpuCard.value}
                    </div>
                  </div>
                </div>
                <p style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '20px', color: '#d4a017' }}>{unoResult}</p>
                <button style={{ ...styles.btn, width: '200px', margin: '0 auto', background: '#f2c94c', color: '#333', fontWeight: 'bold' }} onClick={() => {
                  const colors = ['#ff4d4d', '#f2c94c', '#4da6ff', '#4dff88']; 
                  const values = ['0','1','2','3','4','5','6','7','8','9','+2','反转','跳过','万能'];
                  const getUnoCard = () => {
                    const v = values[Math.floor(Math.random() * values.length)];
                    const c = v === '万能' ? 'wild' : colors[Math.floor(Math.random() * 4)];
                    let power = 0;
                    if (!isNaN(v)) power = parseInt(v);
                    else if (v === '+2') power = 10;
                    else if (v === '反转') power = 11;
                    else if (v === '跳过') power = 12;
                    else if (v === '万能') power = 13;
                    return { value: v, color: c, power: power };
                  };
                  const p = getUnoCard(); const c = getUnoCard();
                  setUnoPlayerCard(p); setUnoCpuCard(c);
                  if (p.power > c.power) setUnoResult("太棒了，你赢了！🎉");
                  else if (p.power < c.power) setUnoResult("电脑赢了，再来一局！💻");
                  else setUnoResult("平局！不分上下 🤝");
                }}>抽 牌</button>
              </div>
            )}

            {/* 8. 默契问答 */}
            {currentTab === 'quiz' && (
              <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>默契</span><span style={{ color: '#d4a017' }}>问答</span></h2>
                {quizIndex < quizData.length ? (
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{quizData[quizIndex].q}</p>
                    {quizData[quizIndex].options.map((opt, i) => (
                      <button key={i} onClick={() => {
                        if (quizAnswered) return;
                        setSelectedOpt(i); setQuizAnswered(true);
                        if (i === quizData[quizIndex].answer) setQuizScore(quizScore + 1);
                      }} style={{ ...styles.btn, background: quizAnswered ? (i === quizData[quizIndex].answer ? '#d4edda' : (i === selectedOpt ? '#f8d7da' : '#f4eeff')) : '#f4eeff', color: '#333', marginBottom: '10px' }}>
                        {opt}
                      </button>
                    ))}
                    {quizAnswered && <button style={{ ...styles.btn, background: '#f2c94c', color: '#333', marginTop: '10px' }} onClick={() => { setQuizIndex(quizIndex + 1); setQuizAnswered(false); setSelectedOpt(null); }}>下一题</button>}
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '20px', marginBottom: '20px', fontWeight: 'bold', color: '#28a745' }}>答对 {quizScore} / {quizData.length} 题！</p>
                    <button style={styles.btn} onClick={() => { setQuizIndex(0); setQuizScore(0); setQuizAnswered(false); }}>再玩一次</button>
                  </div>
                )}
              </div>
            )}

            {/* 9. 扑克牌 */}
            {currentTab === 'poker' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>扑克</span><span style={{ color: '#d4a017' }}>牌</span></h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '30px' }}>
                  <div><span>你的牌</span><div style={{ width: '100px', height: '140px', background: 'white', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: playerCard.color, marginTop: '10px' }}>{playerCard.v}{playerCard.s}</div></div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7a42c9', display: 'flex', alignItems: 'center' }}>VS</div>
                  <div><span>电脑牌</span><div style={{ width: '100px', height: '140px', background: 'white', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: cpuCard.color, marginTop: '10px' }}>{cpuCard.v}{cpuCard.s}</div></div>
                </div>
                <p style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '18px' }}>{pokerResult}</p>
                <button style={{ ...styles.btn, width: '200px', margin: '0 auto', background: '#f2c94c', color: '#333' }} onClick={() => {
                  const suits = ['♠', '♥', '♣', '♦']; const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
                  const getCard = () => {
                    const s = suits[Math.floor(Math.random()*4)]; const v = values[Math.floor(Math.random()*13)];
                    return { v, s, color: s === '♥' || s === '♦' ? 'red' : 'black', power: values.indexOf(v)+2 };
                  };
                  const p = getCard(); const c = getCard();
                  setPlayerCard(p); setCpuCard(c);
                  if (p.power > c.power) setPokerResult("你赢了！🎉");
                  else if (p.power < c.power) setPokerResult("电脑赢了！💻");
                  else setPokerResult("平局！");
                }}>抽 牌</button>
              </div>
            )}

            {/* 10. 柴狐基地 */}
            {currentTab === 'pet' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={styles.title}><span style={{ color: '#7a42c9' }}>🐾 柴狐</span><span style={{ color: '#d4a017' }}>基地 🐾</span></h2>
                <img src={pets[petIndex].img} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #7a42c9', marginBottom: '15px' }} alt={pets[petIndex].name} />
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{pets[petIndex].name}</h3>
                <div style={{ width: '200px', height: '15px', background: '#eee', margin: '10px auto 20px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${hunger}%`, height: '100%', background: '#7a42c9', transition: 'width 0.3s' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button style={{ ...styles.btn, width: '120px', background: '#f2c94c', color: '#333' }} onClick={() => hunger < 100 && setHunger(hunger + 10)}>🍖 喂食</button>
                  <button style={{ ...styles.btn, width: '120px', background: '#eee', color: '#333' }} onClick={() => { setPetIndex((petIndex + 1) % pets.length); setHunger(50); }}>🔄 换一只</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
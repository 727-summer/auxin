'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase'; 

export default function Home() {
  const QUESTION_TEXT = "楼婚一是？"; 
  const ADMIN_ANSWER = "马嘉祺丁程鑫楼金婚";  
  const GUEST_ANSWER = "马嘉祺丁程鑫";  

  const [stage, setStage] = useState('question'); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const [answerInput, setAnswerInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [currentAlbum, setCurrentAlbum] = useState('简介');
  const [photos, setPhotos] = useState([]); 
  const [messages, setMessages] = useState([]); 
  
  const [expandedDate, setExpandedDate] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [msgName, setMsgName] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgUploading, setMsgUploading] = useState(false);

  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPosting, setVideoPosting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadDate, setUploadDate] = useState('');

  const [quizAnswer1, setQuizAnswer1] = useState('');
  const [quizAnswer2, setQuizAnswer2] = useState('');
  const [quizResult, setQuizResult] = useState(null);

  const [gameResult, setGameResult] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);

  const [pokerResult, setPokerResult] = useState(null);
  const [pokerChoices, setPokerChoices] = useState([]);
  const [unoResult, setUnoResult] = useState(null);

  const [adoptedPet, setAdoptedPet] = useState(null);
  const [petHunger, setPetHunger] = useState(50);

  const handleVerifyAnswer = (e) => {
    e.preventDefault();
    const ans = answerInput.trim();
    if (ans === ADMIN_ANSWER) { setIsAdmin(true); setStage('welcome'); } 
    else if (ans === GUEST_ANSWER) { setIsAdmin(false); setStage('welcome'); } 
    else { setErrorMsg(`答案不对哦！请重新回答。`); }
  };

  const fetchData = async () => {
    const { data: photoData } = await supabase.from('photos').select('*').eq('album_name', currentAlbum).order('created_at', { ascending: false });
    if (photoData) setPhotos(photoData);
    const { data: msgData } = await supabase.from('messages').select('*').eq('album_name', currentAlbum).order('created_at', { ascending: false });
    if (msgData) setMessages(msgData);
  };

  useEffect(() => { if (stage === 'main') fetchData(); }, [currentAlbum, stage]);

  useEffect(() => {
    const startMusic = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true); document.removeEventListener('click', startMusic);
        }).catch((e) => console.log("等待点击"));
      }
    };
    document.addEventListener('click', startMusic);
    return () => document.removeEventListener('click', startMusic);
  }, [isPlaying]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play().then(() => setIsPlaying(true)); }
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!isAdmin && currentAlbum !== '小鸡的线下') return alert('只有管理者可以上传！');
    if ((currentAlbum === '爱情之路' || currentAlbum === '小鸡的线下') && !uploadDate) return alert('请选择日期！');

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('album-images').upload(fileName, file);
    if (error) alert('上传失败：' + error.message);
    else {
      const { data: { publicUrl } } = supabase.storage.from('album-images').getPublicUrl(fileName);
      await supabase.from('photos').insert([{ album_name: currentAlbum, image_url: publicUrl, date: uploadDate || '' }]);
      fetchData(); setUploadDate(''); alert('上传成功！✨');
    }
    setUploading(false);
  };

  const handleSendMessage = async () => {
    if (!msgContent.trim()) return alert('留言不能为空');
    setMsgUploading(true);
    await supabase.from('messages').insert([{ album_name: currentAlbum, user_name: msgName || '匿名访客', content: msgContent }]);
    setMsgContent(''); fetchData(); setMsgUploading(false);
  };

  const handlePostVideo = async () => {
    if (!videoTitle.trim() || !videoUrl.trim()) return alert('请填写标题和链接！');
    setVideoPosting(true);
    await supabase.from('messages').insert([{ album_name: currentAlbum, user_name: videoTitle, content: videoUrl }]);
    setVideoTitle(''); setVideoUrl(''); fetchData(); setVideoPosting(false);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    if (quizAnswer1.includes('马嘉祺')) score++;
    if (quizAnswer2.includes('丁程鑫')) score++;
    setQuizResult(score === 2 ? '太棒了！你绝对是十级学者！💜💛' : score === 1 ? '答对了一半，再仔细想想哦～' : '哎呀，去回顾一下物料吧！');
  };

  const playGame = (playerChoice) => {
    const choices = ['石头', '剪刀', '布'];
    const cpuChoice = choices[Math.floor(Math.random() * 3)];
    if (playerChoice === cpuChoice) setGameResult(`平局！都出了【${playerChoice}】`);
    else if ((playerChoice === '石头' && cpuChoice === '剪刀') || (playerChoice === '剪刀' && cpuChoice === '布') || (playerChoice === '布' && cpuChoice === '石头')) {
      setGameResult(`你赢了！【${playerChoice}】胜【${cpuChoice}】🎉`); setPlayerScore(p => p + 1);
    } else { setGameResult(`你输了！【${playerChoice}】败【${cpuChoice}】🥺`); setCpuScore(c => c + 1); }
  };

  const startPoker = () => {
    const suits = ['♠', '♥', '♣', '♦']; const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const getCard = () => ({ suit: suits[Math.floor(Math.random() * 4)], rank: ranks[Math.floor(Math.random() * 13)], value: Math.floor(Math.random() * 13) + 1 });
    setPokerChoices([getCard(), getCard(), getCard(), getCard()]); setPokerResult(null);
  };

  const pickPokerCard = (playerCard) => {
    const suits = ['♠', '♥', '♣', '♦']; const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const getCard = () => ({ suit: suits[Math.floor(Math.random() * 4)], rank: ranks[Math.floor(Math.random() * 13)], value: Math.floor(Math.random() * 13) + 1 });
    const cpuCard = getCard();
    setPokerResult({ player: playerCard, cpu: cpuCard, res: playerCard.value > cpuCard.value ? '你赢了！🎉' : playerCard.value < cpuCard.value ? '你输了...🥺' : '平局！😲' });
    setPokerChoices([]);
  };

  const playUnoWithColor = (playerColor) => {
    const colors = ['红', '黄', '蓝', '绿']; const cpuColor = colors[Math.floor(Math.random() * 4)];
    const pNum = Math.floor(Math.random() * 9) + 1; const cNum = Math.floor(Math.random() * 9) + 1;
    setUnoResult({ player: { color: playerColor, num: pNum }, cpu: { color: cpuColor, num: cNum }, res: pNum > cNum ? '赢了！🎉' : pNum < cNum ? '输了...🥺' : '平局！😲' });
  };

  const pets = [
  { id: 1, name: '柴小祺', desc: '温柔修狗', color: '#e9d5ff', img: '/chaixiaoqi.jpg', quote: '今天也有好好练声哦！'},
  { id: 2, name: '鸡小七', desc: '活泼小鸡', color: '#fef08a', img: '/jixiaoqi.jpg', quote: '快来一起玩' },
  { id: 3, name: '狐小鑫', desc: '贪吃狐狸', color: '#fbcfe8', img: '/huxiaoxin.jpg', quote: '有没有小蓝莓呀'},
  { id: 4, name: '鸡小星', desc: '高冷小鸡', color: '#bfdbfe', img: '/jixiaoxing.jpg', quote: '勉强让你摸一下吧'},
];
  const handleFeed = () => {
    if (petHunger < 100) { 
      setPetHunger(Math.min(petHunger + 20, 100)); 
      alert('喂食成功！它很开心！💜💛'); 
    } else { 
      alert('它已经吃得很饱啦，摸摸它吧！'); 
    }
  };

  const albums = ['简介', '爱情之路', '相册', '舞台视频', '合作music', '小鸡的线下', '七芒星的留言区', '默契问答', '趣味游戏', '扑克牌', 'UNO牌', '柴狐基地'];

  const titleStyle = { 
    background: 'linear-gradient(90deg, #6b21a8 0%, #ca8a04 100%)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent', 
    fontWeight: 'bold' 
  };

  if (stage === 'question') {
    return (
      <div onClick={() => { if(audioRef.current && !isPlaying) { audioRef.current.play().then(()=>setIsPlaying(true)).catch(()=>{}); } }} style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e9d5ff 0%, #fef08a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <audio ref={audioRef} src="/music.mp3" loop />
        <form onSubmit={handleVerifyAnswer} style={{ background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(147,112,219,0.2)' }}>
          <h2 style={{ color: '#6b21a8', marginTop: 0, fontSize: '20px' }}>{QUESTION_TEXT}</h2>
          <input type="text" value={answerInput} onChange={(e) => { setAnswerInput(e.target.value); setErrorMsg(''); }} placeholder="请输入答案..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #ca8a04', marginBottom: '10px' }} />
          {errorMsg && <p style={{ color: 'red', fontSize: '13px' }}>{errorMsg}</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#6b21a8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>提交</button>
        </form>
      </div>
    );
  }

  if (stage === 'welcome') {
    return (
      <div onClick={() => { if(audioRef.current && !isPlaying) { audioRef.current.play().then(()=>setIsPlaying(true)).catch(()=>{}); } }} style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e9d5ff 0%, #fef08a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <audio ref={audioRef} src="/music.mp3" loop />
        <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'spin 8s linear infinite' }}>✨🔯✨</div>
        <h2 style={{ fontSize: '26px', textAlign: 'center', marginBottom: '40px' }}>
          <span style={{color: '#6b21a8'}}>欢迎打开</span>
          <span style={titleStyle}>马嘉祺丁程鑫的爱情手册💜💛</span>
          <span style={{...titleStyle, fontSize: '16px', marginLeft: '8px'}}>（风年工作室）</span>
        </h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setStage('main')} style={{ padding: '12px 40px', fontSize: '18px', fontWeight: 'bold', background: '#ca8a04', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer' }}>Yes</button>
          <button onClick={() => alert('只有点击 Yes 才能进入哦~')} style={{ padding: '12px 40px', fontSize: '18px', fontWeight: 'bold', background: 'transparent', color: '#6b21a8', border: '2px solid #6b21a8', borderRadius: '30px', cursor: 'pointer' }}>No</button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const groupedPhotos = photos.filter(p => p.date).reduce((acc, p) => { if (!acc[p.date]) acc[p.date] = []; acc[p.date].push(p); return acc; }, {});
  let sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(b) - new Date(a));
  if (currentAlbum === '爱情之路' && sortedDates.length === 0) {
    sortedDates = ['2024-01-01', '2024-02-14'];
    groupedPhotos['2024-01-01'] = [{ id: '1', image_url: 'https://via.placeholder.com/150?text=1月1日' }];
    groupedPhotos['2024-02-14'] = [{ id: '2', image_url: 'https://via.placeholder.com/150?text=2月14日' }];
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e9d5ff 0%, #fef08a 100%)', padding: '20px 0' }}>
      <audio ref={audioRef} src="/music.mp3" loop />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
        <h1 style={{ textAlign: 'center', marginTop: 0, marginBottom: '20px', fontSize: '28px' }}>
          <span style={titleStyle}>马嘉祺丁程鑫的爱情手册💜💛</span>
          <span style={{...titleStyle, fontSize: '15px', marginLeft: '8px'}}>（风年工作室）</span>
          <span style={{ fontSize: '18px', marginLeft: '5px' }}>{isAdmin ? '👑' : '✨'}</span>
        </h1>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          {albums.map(album => (
            <button key={album} onClick={() => { setCurrentAlbum(album); setExpandedDate(null); }} style={{ padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', backgroundColor: currentAlbum === album ? '#6b21a8' : 'rgba(255,255,255,0.9)', color: currentAlbum === album ? 'white' : '#6b21a8', fontWeight: 'bold', boxShadow: currentAlbum === album ? '0 2px 8px rgba(107,33,168,0.4)' : 'none' }}>
              {album}
            </button>
          ))}
        </div>

        {/* 简介模块：完美排版加照片 */}
        {currentAlbum === '简介' && (
          <div style={{ background: 'rgba(255,255,255,0.9)', padding: '30px', borderRadius: '15px' }}>
            <h2 style={{ ...titleStyle, textAlign: 'center', marginTop: 0, fontSize: '24px' }}>关于他们</h2>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              
              {/* 💜 马嘉祺档案卡片（左边） */}
              <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', padding: '20px', borderRadius: '15px', border: '2px solid #d8b4fe', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#4c1d95', fontSize: '22px', margin: 0 }}>马嘉祺</h3>
                  <span style={{ background: '#4c1d95', color: 'white', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', marginTop: '5px', display: 'inline-block' }}>（全能队长·实力主唱）</span>
                </div>
                {/* 照片 */}
                <img src="/majiaqi.png" alt="马嘉祺" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                
                <div style={{ color: '#4c1d95', fontSize: '13px', lineHeight: '1.8' }}>
                  <p style={{ margin: '5px 0' }}><strong>姓名：</strong>马嘉祺</p>
                  <p style={{ margin: '5px 0' }}><strong>性别：</strong>男 | <strong>民族：</strong>汉族 | <strong>国籍：</strong>中国</p>
                  <p style={{ margin: '5px 0' }}><strong>出生地：</strong>河南省郑州市</p>
                  <p style={{ margin: '5px 0' }}><strong>出生日期：</strong>2002年12月12日 (23岁)</p>
                  <p style={{ margin: '5px 0' }}><strong>毕业院校：</strong>中央戏剧学院</p>
                  <p style={{ margin: '5px 0' }}><strong>星座：</strong>射手座 | <strong>血型：</strong>O型 | <strong>身高：</strong>178cm</p>
                  <p style={{ margin: '5px 0' }}><strong>粉丝名：</strong>小气球 </p>
                  <p style={{ margin: '5px 0' }}><strong>职业：</strong>歌手、演员</p>
                  <hr style={{ borderColor: '#d8b4fe', margin: '10px 0' }} />
                  <p style={{ margin: '5px 0' }}><strong>代表作：</strong>快乐星球5、什么是快乐星球、浮游、致年少的自己、冰箱没有鸡蛋、唯我论者的独白、潮汐锁定、黑与红、穿帮</p>
                  <p style={{ margin: '5px 0' }}><strong>主要成就：</strong><br/>· 时代少年团队长兼主唱<br/>· 微博年度人气音乐人<br/>· 腾讯音乐娱乐盛典年度团体<br/>· 东方风云榜最佳新锐组合<br/>· 华鼎奖华语最具潜力歌手奖<br/>· 微博音乐盛典年度人气团体</p>
                </div>
              </div>

              {/* 💛 丁程鑫档案卡片（右边） */}
              <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)', padding: '20px', borderRadius: '15px', border: '2px solid #facc15', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#854d0e', fontSize: '22px', margin: 0 }}>丁程鑫</h3>
                  <span style={{ background: '#854d0e', color: 'white', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', marginTop: '5px', display: 'inline-block' }}>（主舞担当·演技新星）</span>
                </div>
                {/* 照片 */}
                <img src="/dingchengxin.png" alt="丁程鑫" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                
                <div style={{ color: '#854d0e', fontSize: '13px', lineHeight: '1.8' }}>
                  <p style={{ margin: '5px 0' }}><strong>姓名：</strong>丁程鑫</p>
                  <p style={{ margin: '5px 0' }}><strong>性别：</strong>男 | <strong>民族：</strong>汉族 | <strong>国籍：</strong>中国</p>
                  <p style={{ margin: '5px 0' }}><strong>出生地：</strong>四川省资阳市安岳县</p>
                  <p style={{ margin: '5px 0' }}><strong>出生日期：</strong>2002年2月24日 (23岁)</p>
                  <p style={{ margin: '5px 0' }}><strong>毕业院校：</strong>北京电影学院</p>
                  <p style={{ margin: '5px 0' }}><strong>星座：</strong>双鱼座 | <strong>血型：</strong>O型 | <strong>身高：</strong>182cm</p>
                  <p style={{ margin: '5px 0' }}><strong>粉丝名：</strong>比邻星 </p>
                  <p style={{ margin: '5px 0' }}><strong>职业：</strong>歌手、演员、舞者</p>
                  <hr style={{ borderColor: '#facc15', margin: '10px 0' }} />
                  <p style={{ margin: '5px 0' }}><strong>代表作：</strong>人造神、芥、新伤、Monster、一起跳舞吧、去北极忘记你</p>
                  <p style={{ margin: '5px 0' }}><strong>主要成就：</strong><br/>· 时代少年团主舞担当<br/>· 演员请就位新生代演员代表<br/>· 东方风云榜最佳新锐组合<br/>· 腾讯视频星光大赏年度团体<br/>· 微博年度人气艺人</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {(currentAlbum === '爱情之路' || currentAlbum === '相册' || currentAlbum === '小鸡的线下') && (
          <div>
            {currentAlbum === '小鸡的线下' && <h3 style={{ ...titleStyle, textAlign: 'center', fontSize: '22px' }}>请小鸡们留下你的线下回忆吧💜💛</h3>}
            
            {(isAdmin || currentAlbum === '小鸡的线下') && (
              <div style={{ marginBottom: 20, textAlign: 'center', background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '15px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                {(currentAlbum === '爱情之路' || currentAlbum === '小鸡的线下') && <input type="date" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ca8a04' }} />}
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ color: '#6b21a8' }} />
              </div>
            )}
            {(currentAlbum === '爱情之路' || currentAlbum === '小鸡的线下') && (
              <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '3px solid #ca8a04', marginLeft: '10px' }}>
                {sortedDates.map(date => (
                  <div key={date} style={{ marginBottom: '20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-29px', top: '0', width: '15px', height: '15px', borderRadius: '50%', background: '#6b21a8', border: '2px solid #fff' }}></div>
                    <button onClick={() => setExpandedDate(expandedDate === date ? null : date)} style={{ background: '#fff', border: '2px solid #6b21a8', color: '#6b21a8', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>📅 {date} {expandedDate === date ? '▲' : '▼'}</button>
                    {expandedDate === date && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                        {groupedPhotos[date].map(photo => (
                          <div key={photo.id} style={{ position: 'relative' }}>
                            <img src={photo.image_url} alt="相册" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                            <a href={photo.image_url} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(107,33,168,0.8)', color: 'white', padding: '4px 8px', borderRadius: '5px', fontSize: '12px', textDecoration: 'none' }}>保存/查看</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {currentAlbum === '相册' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {photos.filter(p => !p.date).map(photo => (
                  <div key={photo.id} style={{ position: 'relative' }}>
                    <img src={photo.image_url} alt="相册" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                    <a href={photo.image_url} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(107,33,168,0.8)', color: 'white', padding: '4px 8px', borderRadius: '5px', fontSize: '12px', textDecoration: 'none' }}>保存/查看</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(currentAlbum === '舞台视频' || currentAlbum === '合作music') && (
          <div style={{ background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '15px' }}>
            <h3 style={{ ...titleStyle, marginTop: 0, textAlign: 'center', fontSize: '22px' }}>{currentAlbum}</h3>
            {isAdmin && (
              <div style={{ background: '#fdf4ff', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="视频标题" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ca8a04' }} />
                <input type="text" placeholder="链接地址" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ca8a04' }} />
                <button onClick={handlePostVideo} disabled={videoPosting} style={{ padding: '8px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>发布</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(item => (
                <div key={item.id} style={{ background: '#fff', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #6b21a8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#4c1d95' }}>{item.user_name}</span>
                  <a href={item.content} target="_blank" rel="noreferrer" style={{ background: '#6b21a8', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', textDecoration: 'none' }}>点击观看</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentAlbum === '七芒星的留言区' && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '15px' }}>
            <h3 style={{ ...titleStyle, textAlign: 'center', marginTop: 0, fontSize: '22px' }}>想对嘉祺程鑫说什么？</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="名字" value={msgName} onChange={(e) => setMsgName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ca8a04' }} />
              <textarea placeholder="留言..." value={msgContent} onChange={(e) => setMsgContent(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ca8a04', minHeight: '80px' }} />
              <button onClick={handleSendMessage} disabled={msgUploading} style={{ padding: '10px', background: '#6b21a8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>发射留言</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ background: '#fff', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #ca8a04' }}>
                  <div style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 'bold', marginBottom: '5px' }}><strong>{msg.user_name}</strong></div>
                  <div style={{ fontSize: '14px', color: '#333' }}>{msg.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentAlbum === '默契问答' && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '15px' }}>
            <h3 style={{ ...titleStyle, textAlign: 'center', marginTop: 0, fontSize: '22px' }}>默契问答挑战</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <div><p style={{ fontWeight: 'bold', color: '#4c1d95' }}>1. 时代少年团队长是谁？</p><input type="text" value={quizAnswer1} onChange={(e) => setQuizAnswer1(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ca8a04' }} /></div>
              <div><p style={{ fontWeight: 'bold', color: '#4c1d95' }}>2. 谁是小狐狸？</p><input type="text" value={quizAnswer2} onChange={(e) => setQuizAnswer2(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ca8a04' }} /></div>
              <button onClick={handleQuizSubmit} style={{ padding: '12px', background: '#6b21a8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>提交答案</button>
              {quizResult && <div style={{ marginTop: '15px', padding: '15px', background: '#fdf4ff', borderLeft: '4px solid #ca8a04', borderRadius: '5px', color: '#6b21a8', fontWeight: 'bold' }}>{quizResult}</div>}
            </div>
          </div>
        )}

        {currentAlbum === '趣味游戏' && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ ...titleStyle, marginTop: 0, fontSize: '22px' }}>猜拳挑战</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontWeight: 'bold', color: '#ca8a04' }}><div>粉丝: {playerScore}</div><div>电脑: {cpuScore}</div></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              <button onClick={() => playGame('石头')} style={{ padding: '15px 25px', fontSize: '24px', background: '#f3e8ff', border: '2px solid #6b21a8', borderRadius: '15px' }}>✊</button>
              <button onClick={() => playGame('剪刀')} style={{ padding: '15px 25px', fontSize: '24px', background: '#fef08a', border: '2px solid #ca8a04', borderRadius: '15px' }}>✌️</button>
              <button onClick={() => playGame('布')} style={{ padding: '15px 25px', fontSize: '24px', background: '#f3e8ff', border: '2px solid #6b21a8', borderRadius: '15px' }}>🖐️</button>
            </div>
            {gameResult && <div style={{ padding: '15px', background: '#fff', border: '2px dashed #ca8a04', borderRadius: '10px', color: '#4c1d95', fontWeight: 'bold' }}>{gameResult}</div>}
          </div>
        )}

        {currentAlbum === '扑克牌' && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ ...titleStyle, marginTop: 0, fontSize: '22px' }}>凭直觉选一张牌</h3>
            {pokerChoices.length === 0 && !pokerResult && <button onClick={startPoker} style={{ padding: '15px 40px', fontSize: '18px', background: '#6b21a8', color: 'white', borderRadius: '30px' }}>开始抽牌</button>}
            
            {pokerChoices.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                {pokerChoices.map((card, idx) => (
                  <div key={idx} onClick={() => pickPokerCard(card)} style={{ cursor: 'pointer', width: '70px', height: '100px', background: 'linear-gradient(135deg, #4c1d95 0%, #ca8a04 100%)', borderRadius: '10px', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>?</div>
                ))}
              </div>
            )}

            {pokerResult && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
                <div><p>你的牌</p><div style={{ fontSize: '30px', background: '#fff', padding: '15px', borderRadius: '10px', border: '2px solid #6b21a8' }}>{pokerResult.player.suit} {pokerResult.player.rank}</div></div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ca8a04' }}>VS</div>
                <div><p>电脑的牌</p><div style={{ fontSize: '30px', background: '#fff', padding: '15px', borderRadius: '10px', border: '2px solid #ca8a04' }}>{pokerResult.cpu.suit} {pokerResult.cpu.rank}</div></div>
              </div>
            )}
            {pokerResult && <div style={{ color: '#6b21a8', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>{pokerResult.res}</div>}
            {pokerResult && <button onClick={startPoker} style={{ padding: '10px 20px', background: '#6b21a8', color: 'white', borderRadius: '20px' }}>再玩一次</button>}
          </div>
        )}

        {currentAlbum === 'UNO牌' && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ ...titleStyle, marginTop: 0, fontSize: '22px' }}>选个幸运色</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              <button onClick={() => playUnoWithColor('红')} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></button>
              <button onClick={() => playUnoWithColor('黄')} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eab308', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></button>
              <button onClick={() => playUnoWithColor('蓝')} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></button>
              <button onClick={() => playUnoWithColor('绿')} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></button>
            </div>
            
            {unoResult && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}><p style={{ color: '#666' }}>你的牌</p><div style={{ fontSize: '30px', background: unoResult.player.color === '红' ? '#ef4444' : unoResult.player.color === '黄' ? '#eab308' : unoResult.player.color === '蓝' ? '#3b82f6' : '#22c55e', color: 'white', padding: '30px', borderRadius: '15px', fontWeight: 'bold' }}>{unoResult.player.num}</div></div>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#ca8a04' }}>VS</div>
                <div style={{ textAlign: 'center' }}><p style={{ color: '#666' }}>电脑的牌</p><div style={{ fontSize: '30px', background: unoResult.cpu.color === '红' ? '#ef4444' : unoResult.cpu.color === '黄' ? '#eab308' : unoResult.cpu.color === '蓝' ? '#3b82f6' : '#22c55e', color: 'white', padding: '30px', borderRadius: '15px', fontWeight: 'bold' }}>{unoResult.cpu.num}</div></div>
              </div>
            )}
            {unoResult && <div style={{ color: '#6b21a8', fontWeight: 'bold', fontSize: '20px' }}>{unoResult.res}</div>}
          </div>
        )}

        {currentAlbum === '柴狐基地' && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ ...titleStyle, marginTop: 0, fontSize: '22px' }}>🐾 柴狐基地 🐾</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>点击领养属于你的Q版小可爱吧！</p>
            
            {!adoptedPet ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {pets.map(pet => (
                  <div key={pet.id} onClick={() => { setAdoptedPet(pet); setPetHunger(50); }} style={{ cursor: 'pointer', textAlign: 'center', padding: '15px', background: pet.color, borderRadius: '15px', width: '140px', transition: 'transform 0.2s' }}>
                   <div style={{ 
    width: '100px', 
    height: '100px', 
    margin: '0 auto', 
    backgroundImage: `url(${pet.img})`, // 👈 关键在这里！用反引号，并且读取 pet.img
    backgroundSize: 'cover',             // 👈 让图片铺满圆形
    backgroundPosition: 'center',        // 👈 让图片居中显示
    borderRadius: '50%'                  // 👈 如果之前没有，加上这个变圆
}}></div>
                    <h4 style={{ margin: '10px 0 5px', color: '#333' }}>{pet.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{pet.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', background: adoptedPet.color, borderRadius: '20px', maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ width: '150px', height: '150px', margin: '0 auto', backgroundImage: 'url(/pets.png)', backgroundPosition: adoptedPet.pos, backgroundSize: '200% 200%', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}></div>
                <h2 style={{ color: '#333', margin: '15px 0 5px' }}>{adoptedPet.name}</h2>
                <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px' }}>“{adoptedPet.quote}”</p>
                
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.5)', padding: '10px 15px', borderRadius: '10px', marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 'bold' }}>饱食度:</p>
                  <div style={{ width: '100%', height: '10px', background: '#ddd', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${petHunger}%`, height: '100%', background: '#6b21a8', transition: 'width 0.3s' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={handleFeed} style={{ padding: '10px 20px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>🍖 喂食</button>
                  <button onClick={() => setAdoptedPet(null)} style={{ padding: '10px 20px', background: '#fff', color: '#6b21a8', border: '2px solid #6b21a8', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>换一只</button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <button onClick={toggleMusic} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '55px', height: '55px', borderRadius: '50%', background: 'white', border: '2px solid #6b21a8', cursor: 'pointer', boxShadow: '0 4px 15px rgba(107,33,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
        <span style={{ fontSize: '26px', fontWeight: 'bold', background: 'linear-gradient(135deg, #6b21a8 0%, #ca8a04 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{isPlaying ? '⏸' : '🎵'}</span>
      </button>
    </div>
  );
}
'use client';
import React, { useState } from 'react';
import { Brain, Clock } from 'lucide-react';
import { addDocument, aiChatTitle, answerTxt, askAboutDocs, embedding, noFileMsg, questionsHere, sendTxt, thinking } from './consts';

export default function Page() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [fileName, setFileName] = useState('');

  const ask = async () => {
    setAnswer(null);

    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    console.log(res)

    if (res.status == 500) {
      setAnswer(res.statusText);
      //setCitations(data.citations || []);
      setFileName('');
      return;
    }

    const data = await res.json();

    setAnswer(data.answer);
    setCitations(data.citations || []);
    setFileName('');
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setUploading(true);
    setFileName(f.name ? f.name : '');

    const fd = new FormData();
    fd.append('file', f);

    const res = await fetch('/api/embed', { method: 'POST', body: fd });
    const data = await res.json();

    setUploading(false);
    alert(data.message || 'Done');
  };

  const clickFile = () => {
    document.getElementById('fileupload')?.click();
  }

  const buttonDisabled = uploading || (!fileName && !question);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4 main-container">
      <h1 className="text-3xl font-bold flex flex-row justify-start align-center gap-3">
        <Brain className='brain-icon' />
        {aiChatTitle}
      </h1>
      <div className="space-y-4">
        <div className="card space-y-2 flex flex-col pb-6 p-5 top-card">
          <div className={'input-area flex items-center justify-start gap-6 space-y-3 p-6 bg-black/20 rounded-2xl border ' + (fileName ? 'border-active' : 'border-deactive' )}>
            <button onClick={clickFile} className='bg-slate-700 hover:bg-sky-700 px-[40px] py-[15px] rounded-lg cursor-pointer m-0' disabled={uploading}>
              {uploading ? embedding : addDocument}
            </button>
            <div className='flex'>
              <input id="fileupload" onChange={upload} type="file" accept=".pdf,.md,.txt" className="input hidden" />
              <span className={'' + (fileName ? ' text-lime-400' : '')}>{fileName ? fileName : noFileMsg}</span>
            </div>
          </div>
          <div className='py-[10px]'>
            <div>
              <span className='px-2'>{askAboutDocs}</span>
            </div>
            <input className="input" value={question} onChange={e => setQuestion(e.target.value)} placeholder={questionsHere} />
            <div className='flex justify-end align-center mt-5'>
              <button onClick={ask} className={'self-end px-[40px] py-[15px] rounded-lg' + (buttonDisabled ? ' bg-black/10 text-white/20' : ' cursor-pointer bg-slate-700 hover:bg-sky-700') } disabled={buttonDisabled}>
                {uploading ? thinking : sendTxt}
              </button>
            </div>
          </div>
        </div>
      </div>

      {answer && (
        <div className="card space-y-2 p-5">
          <h2 className="text-xl font-semibold text-[#f45]">{answerTxt}</h2>
          <p>{answer}</p>
          <div className="opacity-70 text-sm">
            {citations.map((c, i) => (
              <div key={i}>
                <strong>{c.source}</strong> p.{c.page ?? '-'}
                <div className="text-xs">{c.snippet}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

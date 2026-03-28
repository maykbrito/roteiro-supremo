import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Plus, Trash2, AlertTriangle, Menu, X, FileText, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ScriptData, INITIAL_DATA } from './types';
import { Microlearning } from './components/Microlearning';
import { Preview } from './components/Preview';
import { cn } from './lib/utils';
import { useAutoSave } from './hooks/useAutoSave';

export default function App() {
  const [scriptId, setScriptId] = useState<Id<"scripts"> | null>(() => {
    const saved = localStorage.getItem('roteiro_supremo_id');
    return saved ? (saved as Id<"scripts">) : null;
  });
  const [localData, setLocalData] = useState<ScriptData>(INITIAL_DATA);
  const [step, setStep] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scripts = useQuery(api.scripts.listScripts);
  const currentScript = useQuery(api.scripts.getScript, { id: scriptId ?? undefined });
  const upsertScript = useMutation(api.scripts.upsertScript);
  const deleteScript = useMutation(api.scripts.deleteScript);

  // Sync Convex data to local state when the script identity changes.
  // IMPORTANT: we do NOT sync if the server is just echoing back what we already saved.
  // That echo is what causes the "typing gets erased" bug in debounced apps:
  //   1. user types → debounce saves → Convex emits updated currentScript
  //   2. this effect runs → setLocalData overwrites what the user typed in the meantime
  // Fix: only apply the server data when the script identity switches (different _id or
  // first load), tracked via a ref so we don't re-run on every currentScript emission.
  const loadedScriptIdRef = useRef<string | null>(undefined as unknown as null);
  useEffect(() => {
    const incomingId = currentScript?._id ?? null;
    const identityChanged = incomingId !== loadedScriptIdRef.current;

    if (currentScript && identityChanged) {
      loadedScriptIdRef.current = incomingId;
      setLocalData({
        title: currentScript.title,
        thumbIdea: currentScript.thumbIdea,
        objective: currentScript.objective,
        difficulties: currentScript.difficulties,
        discovery: currentScript.discovery,
        objections: currentScript.objections,
        name: currentScript.name,
        whoYouAre: currentScript.whoYouAre,
        whatYouDo: currentScript.whatYouDo,
        connectionStrategy: currentScript.connectionStrategy as any,
        parts: currentScript.parts,
        transition: currentScript.transition,
        cta: currentScript.cta,
        recommendedVideo: currentScript.recommendedVideo,
      });
    } else if (!scriptId && incomingId !== loadedScriptIdRef.current) {
      loadedScriptIdRef.current = null;
      setLocalData(INITIAL_DATA);
    }
  }, [currentScript, scriptId]);

  const { isSaving } = useAutoSave({
    data: localData,
    scriptId,
    saveFn: upsertScript,
    onNewId: (id) => {
      setScriptId(id);
      localStorage.setItem('roteiro_supremo_id', id);
    },
  });

  const updateData = (updates: Partial<ScriptData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  };

  const handleNewScript = () => {
    setScriptId(null);
    localStorage.removeItem('roteiro_supremo_id');
    setLocalData(INITIAL_DATA);
    setStep(0);
    setIsSidebarOpen(false);
  };

  const handleSelectScript = (id: Id<"scripts">) => {
    setScriptId(id);
    localStorage.setItem('roteiro_supremo_id', id);
    setStep(0);
    setIsSidebarOpen(false);
  };

  const handleDeleteScript = async (e: React.MouseEvent, id: Id<"scripts">) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este roteiro?")) {
      await deleteScript({ id });
      if (scriptId === id) {
        handleNewScript();
      }
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const steps = [
    { title: 'A Vitrine', subtitle: 'Módulo 0' },
    { title: '30 Segundos Cruciais', subtitle: 'Módulo 1' },
    { title: 'Quem é você?', subtitle: 'Módulo 2 & 3' },
    { title: 'O Recheio', subtitle: 'Módulo 4' },
    { title: 'A Saída Invisível', subtitle: 'Módulo 5 & 6' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isSidebarOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-80 border-r border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 p-6">
            <h2 className="font-serif text-xl font-bold italic text-orange-600">Meus Roteiros</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-900">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={handleNewScript}
              className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-zinc-200 p-4 text-zinc-500 hover:border-orange-300 hover:text-orange-600 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span className="font-bold">Novo Roteiro</span>
            </button>

            {!scripts ? (
              <div className="flex flex-col items-center justify-center p-8 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <p className="text-[10px] text-zinc-400">Conectando ao Convex...</p>
              </div>
            ) : scripts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-zinc-400">Nenhum roteiro salvo ainda.</p>
                <p className="text-[10px] text-zinc-300 italic">Comece a escrever para salvar seu primeiro roteiro!</p>
              </div>
            ) : (
              scripts.map(s => (
                <div
                  key={s._id}
                  onClick={() => handleSelectScript(s._id)}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                    scriptId === s._id 
                      ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" 
                      : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className={cn("h-5 w-5 shrink-0", scriptId === s._id ? "text-orange-500" : "text-zinc-400")} />
                    <div className="overflow-hidden">
                      <p className="truncate font-bold text-zinc-900">{s.title || "Roteiro sem título"}</p>
                      <p className="text-[10px] text-zinc-400">{new Date(s.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteScript(e, s._id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.aside>

      {/* Left Side: Guided Editor */}
      <div className="flex w-1/2 flex-col border-r border-zinc-200 bg-white">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-100 p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold italic text-orange-600">Roteiro Supremo</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">O App Professor</p>
                {isSaving && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Salvando...
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNewScript}
              className="hidden sm:flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-all"
            >
              <Plus className="h-4 w-4" />
              Novo Roteiro
            </button>
            <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-all",
                  i === step ? "bg-orange-500 w-12" : i < step ? "bg-orange-200" : "bg-zinc-100"
                )}
              />
            ))}
          </div>
        </div>
      </header>

        {/* Wizard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-xl"
            >
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">{steps[step].subtitle}</span>
                <h2 className="font-serif text-4xl italic">{steps[step].title}</h2>
              </div>

              {step === 0 && (
                <div className="space-y-6">
                  <Microlearning title="Por que isso importa?">
                    O título e a thumb são a porta de entrada. Se a pessoa não clicar, o roteiro não serve de nada. Foque em dores, dificuldades ou desejos fortes. Mostre uma transformação (antes e depois).
                  </Microlearning>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Título do Vídeo</label>
                    <input
                      type="text"
                      value={localData.title}
                      onChange={e => updateData({ title: e.target.value })}
                      placeholder="Ex: Como eu saí do zero aos 10k seguidores em 30 dias"
                      className="w-full rounded-lg border border-zinc-200 p-4 text-lg focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ideia da Thumb</label>
                    <textarea
                      value={localData.thumbIdea}
                      onChange={e => updateData({ thumbIdea: e.target.value })}
                      placeholder="Ex: Lado esquerdo triste (0 seguidores), lado direito feliz (10.000 seguidores)"
                      className="h-32 w-full rounded-lg border border-zinc-200 p-4 text-lg focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800 border border-red-100 mb-4">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">Nível de atenção alto! Se errar aqui, o vídeo morre.</p>
                  </div>

                  <Microlearning title="A Fórmula dos 30 Segundos">
                    Use a dor do seu público a seu favor. O objetivo deve ser claro, as dificuldades devem gerar empatia, e a descoberta deve prometer a solução.
                  </Microlearning>

                  <div className="grid gap-6">
                    {[
                      { id: 'objective', label: 'Objetivo', placeholder: 'O que vamos aprender hoje?' },
                      { id: 'difficulties', label: 'Dificuldades', placeholder: 'Por que é tão difícil fazer isso?' },
                      { id: 'discovery', label: 'Descoberta', placeholder: 'O que você descobriu que mudou tudo?' },
                      { id: 'objections', label: 'Objeções', placeholder: 'O que as pessoas pensam que impede elas?' },
                    ].map(field => (
                      <div key={field.id} className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{field.label}</label>
                        <input
                          type="text"
                          value={(localData as any)[field.id]}
                          onChange={e => updateData({ [field.id]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-zinc-200 p-3 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Microlearning title="Matando Objeções">
                    As pessoas precisam confiar em você. Escolha uma estratégia que conecte sua jornada com a necessidade do espectador.
                  </Microlearning>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Seu Nome / Frase</label>
                      <input
                        type="text"
                        value={localData.name}
                        onChange={e => updateData({ name: e.target.value })}
                        placeholder="Ex: Eu sou o Fulano..."
                        className="w-full rounded-lg border border-zinc-200 p-3 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">O que você faz</label>
                      <input
                        type="text"
                        value={localData.whatYouDo}
                        onChange={e => updateData({ whatYouDo: e.target.value })}
                        placeholder="Ex: Especialista em Marketing"
                        className="w-full rounded-lg border border-zinc-200 p-3 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estratégia de Conexão</label>
                    <div className="grid gap-3">
                      {[
                        { id: 'fiz-por-voce', label: 'Fiz por você', desc: 'Paguei o preço para aprender.' },
                        { id: 'inimigo-comum', label: 'Inimigo em comum', desc: 'A verdade é que perdemos tempo com...' },
                        { id: 'dados-provas', label: 'Dados ou provas', desc: 'Este foi o resultado que eu tive...' },
                      ].map(strategy => (
                        <button
                          key={strategy.id}
                          onClick={() => updateData({ connectionStrategy: strategy.id as any })}
                          className={cn(
                            "flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                            localData.connectionStrategy === strategy.id
                              ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                              : "border-zinc-200 hover:border-zinc-300"
                          )}
                        >
                          <span className="font-bold text-zinc-900">{strategy.label}</span>
                          <span className="text-xs text-zinc-500">{strategy.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Microlearning title="A Regra de 3">
                    Divida seu conteúdo em 3 partes principais. É o limite que o cérebro humano processa com facilidade sem se sentir sobrecarregado.
                  </Microlearning>

                  <div className="space-y-4">
                    {localData.parts.map((part, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Parte {index + 1}</label>
                          {index === 1 && (
                            <span className="text-[10px] font-bold text-orange-600 animate-pulse">
                              ✨ Momento ideal para pedir Like/Inscrição!
                            </span>
                          )}
                          {localData.parts.length > 1 && (
                            <button 
                              onClick={() => {
                                const newParts = [...localData.parts];
                                newParts.splice(index, 1);
                                updateData({ parts: newParts });
                              }}
                              className="text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <textarea
                          value={part}
                          onChange={e => {
                            const newParts = [...localData.parts];
                            newParts[index] = e.target.value;
                            updateData({ parts: newParts });
                          }}
                          placeholder={`O que você vai ensinar na parte ${index + 1}?`}
                          className="h-24 w-full rounded-lg border border-zinc-200 p-3 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={() => updateData({ parts: [...localData.parts, ''] })}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 p-4 text-zinc-400 hover:border-orange-300 hover:text-orange-500 transition-all"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Adicionar mais uma parte</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800 border border-red-100 mb-4">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">ALERTA VERMELHO: Nunca dê a ideia de que o vídeo está acabando!</p>
                  </div>

                  <Microlearning title="A Saída Invisível">
                    Se o espectador perceber que o vídeo está no fim, ele sai antes do CTA. Use conectivos de transição para manter a curiosidade.
                  </Microlearning>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Conectivo de Transição</label>
                    <input
                      type="text"
                      value={localData.transition}
                      onChange={e => updateData({ transition: e.target.value })}
                      placeholder="Ex: Agora eu fiquei pensando..."
                      className="w-full rounded-lg border border-zinc-200 p-3 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Chamadas para Ação (CTA)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Inscrição', 'Comentário', 'Outro Vídeo', 'Produto'].map(cta => (
                        <button
                          key={cta}
                          onClick={() => {
                            const newCta = localData.cta.includes(cta)
                              ? localData.cta.filter(c => c !== cta)
                              : [...localData.cta, cta];
                            updateData({ cta: newCta });
                          }}
                          className={cn(
                            "rounded-lg border p-3 text-sm font-medium transition-all",
                            localData.cta.includes(cta)
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                          )}
                        >
                          {cta}
                        </button>
                      ))}
                    </div>
                    {localData.cta.length > 1 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                        ⚠️ NÃO peça tudo ao mesmo tempo! Escolha o mais importante.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vídeo Recomendado (Opcional)</label>
                    <input
                      type="text"
                      value={localData.recommendedVideo}
                      onChange={e => updateData({ recommendedVideo: e.target.value })}
                      placeholder="Um vídeo que tenha total ligação com este..."
                      className="w-full rounded-lg border border-zinc-200 p-3 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Navigation */}
        <footer className="border-t border-zinc-100 p-6">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>
            <button
              onClick={nextStep}
              disabled={step === steps.length - 1}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-8 py-3 font-bold text-white hover:bg-zinc-800 disabled:opacity-0 transition-all shadow-lg"
            >
              Próximo Passo
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </footer>
      </div>

      {/* Right Side: Preview */}
      <div className="w-1/2">
        <Preview data={localData} />
      </div>
    </div>
  );
}

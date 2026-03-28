import confetti from "canvas-confetti";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import type { ScriptData } from "../types";

interface PreviewProps {
	data: ScriptData;
}

export function Preview({ data }: PreviewProps) {
	const [copied, setCopied] = useState(false);

	const formatScript = () => {
		let script = "";

		if (data.title || data.thumbIdea) {
			script += "--- MÓDULO 0: A VITRINE ---\n";
			if (data.title) script += `TÍTULO: ${data.title}\n`;
			if (data.thumbIdea) script += `THUMB: ${data.thumbIdea}\n`;
			script += "\n";
		}

		if (
			data.objective ||
			data.difficulties ||
			data.discovery ||
			data.objections
		) {
			script += "--- MÓDULO 1: OS 30 SEGUNDOS CRUCIAIS ---\n";
			if (data.objective) script += `OBJETIVO: ${data.objective}\n`;
			if (data.difficulties) script += `DIFICULDADES: ${data.difficulties}\n`;
			if (data.discovery) script += `DESCOBERTA: ${data.discovery}\n`;
			if (data.objections) script += `OBJEÇÕES: ${data.objections}\n`;
			script += "\n";
		}

		if (
			data.name ||
			data.whoYouAre ||
			data.whatYouDo ||
			data.connectionStrategy
		) {
			script += "--- MÓDULO 2 & 3: APRESENTAÇÃO E PONTE ---\n";
			if (data.name) script += `NOME: ${data.name}\n`;
			if (data.whoYouAre) script += `QUEM É: ${data.whoYouAre}\n`;
			if (data.whatYouDo) script += `O QUE FAZ: ${data.whatYouDo}\n`;
			if (data.connectionStrategy) {
				const strategies = {
					"fiz-por-voce": "Fiz por você (Paguei o preço)",
					"inimigo-comum": "Inimigo em comum",
					"dados-provas": "Dados ou provas",
				};
				script += `ESTRATÉGIA: ${strategies[data.connectionStrategy as keyof typeof strategies]}\n`;
			}
			script += "\n";
		}

		const validParts = data.parts.filter((p) => p.trim() !== "");
		if (validParts.length > 0) {
			script += "--- MÓDULO 4: O RECHEIO (CONTEÚDO) ---\n";
			validParts.forEach((part, i) => {
				script += `PARTE ${i + 1}: ${part}\n`;
			});
			script += "\n";
		}

		if (data.transition || data.cta.length > 0 || data.recommendedVideo) {
			script += "--- MÓDULO 5 & 6: FINALIZAÇÃO E CTA ---\n";
			if (data.transition) script += `TRANSIÇÃO: ${data.transition}\n`;
			if (data.cta.length > 0) script += `CTAs: ${data.cta.join(", ")}\n`;
			if (data.recommendedVideo)
				script += `VÍDEO RECOMENDADO: ${data.recommendedVideo}\n`;
		}

		return script.trim();
	};

	const handleCopy = () => {
		const text = formatScript();
		navigator.clipboard.writeText(text);
		setCopied(true);
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		});
		setTimeout(() => setCopied(false), 2000);
	};

	const scriptContent = formatScript();

	return (
		<div className="flex h-full flex-col bg-zinc-900 p-6 text-zinc-100">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-serif text-2xl italic text-zinc-400">
					A Versão de Aplicação
				</h2>
				<button
					onClick={handleCopy}
					disabled={!scriptContent}
					className={cn(
						"flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all",
						copied
							? "bg-green-500 text-white"
							: "bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed",
					)}
				>
					{copied ? (
						<Check className="h-5 w-5" />
					) : (
						<Copy className="h-5 w-5" />
					)}
					{copied ? "Copiado!" : "Copiar Roteiro"}
				</button>
			</div>

			<div className="flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-8 font-mono text-sm leading-relaxed shadow-inner">
				{!scriptContent ? (
					<div className="flex h-full items-center justify-center text-zinc-700 italic">
						Comece a escrever para ver seu roteiro aqui...
					</div>
				) : (
					<pre className="whitespace-pre-wrap wrap-break-word">
						{scriptContent.split("\n").map((line, i) => {
							if (line.startsWith("---")) {
								return (
									<div
										key={i}
										className="mt-6 mb-2 text-orange-500 font-bold border-b border-zinc-800 pb-1"
									>
										{line}
									</div>
								);
							}
							if (line.includes(": ")) {
								const [label, content] = line.split(": ");
								return (
									<div key={i} className="mb-2">
										<span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-0.5">
											{label}
										</span>
										<span className="text-zinc-200">{content}</span>
									</div>
								);
							}
							return (
								<div key={i} className="mb-2">
									{line}
								</div>
							);
						})}
					</pre>
				)}
			</div>

			<div className="mt-4 text-center">
				<p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
					Falou mostrou, não deu? Escreveu!
				</p>
			</div>
		</div>
	);
}

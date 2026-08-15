# Audio Study

Aplicação para criar coleções de trechos de texto e gerar um único
arquivo de áudio (TTS) com todos os trechos unidos, na ordem definida.

## Requisitos do sistema

Além das dependências Python (`requirements.txt`), o TTS local
(`pyttsx3`) depende do mecanismo **espeak** e a junção de áudio
(`pydub`) depende do **ffmpeg** instalados no sistema operacional.

No Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y espeak ffmpeg
```

## Instalação

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Execução

```bash
python3 -m app.main
```

Acesse http://127.0.0.1:5000 no navegador.

## Fluxo principal

1. Na tela inicial, clique em "Criar nova coleção" e informe um nome.
2. Adicione um ou mais trechos de texto. É possível reordenar
   (setas ▲/▼) ou remover trechos antes de concluir.
3. Clique em "Concluir": a coleção é salva e o backend gera o áudio
   de cada trecho, unindo tudo em um único arquivo `.mp3` com uma
   pequena pausa entre os trechos.
4. O áudio gerado aparece com um player e um link de download.
5. Coleções salvas podem ser reabertas a qualquer momento na tela
   inicial para edição ou nova geração de áudio, e também podem ser
   excluídas.

## Estrutura

```
app/
  main.py                  → servidor Flask e rotas da API
  collection_manager/manager.py → persistência das coleções (data/collections)
  tts/engine.py             → conversão texto → áudio (pyttsx3)
  audio/merger.py           → junção dos áudios (pydub)
frontend/
  index.html, style.css, app.js → interface e comunicação com a API
data/
  collections/               → coleções salvas (JSON)
  audio/                      → áudios finais gerados
temp/
  → arquivos temporários (removidos automaticamente após cada geração)
```

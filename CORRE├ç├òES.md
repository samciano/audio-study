# Correções aplicadas no Audio Study

## 1. Frontend não conversava com o backend (bug principal)
O `frontend/app.js` original guardava as coleções só em uma variável
JavaScript em memória (`let collections = []`), sem nunca chamar a API
Flask (`/api/collections`, `/generate`, etc). Resultado: nada era salvo,
o botão "Concluir" não gerava áudio nenhum, e tudo se perdia ao recarregar
a página.

**Corrigido:** o `app.js` foi reescrito para usar `fetch` e falar de
verdade com o backend:
- `GET /api/collections` para listar coleções ao abrir a tela inicial.
- `POST /api/collections` para criar uma coleção nova.
- `PUT /api/collections/<id>` para salvar edições em uma coleção existente.
- `DELETE /api/collections/<id>` para excluir uma coleção.
- `POST /api/collections/<id>/generate` para disparar a geração do áudio.
- O áudio gerado é exibido com um `<audio controls>` na tela da coleção,
  inclusive ao reabrir uma coleção que já tinha sido gerada antes
  (guardamos `audio_filename` na própria coleção).

## 2. Faltava editar, excluir e reordenar trechos
O README descreve que o usuário deve poder "editar, excluir ou reordenar
os trechos antes de concluir", mas o frontend só permitia adicionar e
editar o texto. Adicionei botões ▲ ▼ (mover) e "Excluir" em cada trecho.

## 3. Possível falha silenciosa do TTS em coleções com vários trechos
`app/tts/engine.py` reaproveitava a mesma instância do `pyttsx3.init()`
para gerar todos os trechos em sequência dentro do laço em `main.py`.
Esse é um problema conhecido do pyttsx3: chamar `save_to_file` +
`runAndWait()` várias vezes na mesma instância frequentemente falha
silenciosamente a partir do segundo trecho (o arquivo não é gerado ou
fica vazio), quebrando a junção de áudio depois.

**Corrigido:** o engine agora é reinicializado (`pyttsx3.init()`) antes
de cada trecho, reaplicando voz/velocidade/volume, e o código agora
verifica se o arquivo de áudio foi realmente criado, lançando um erro
claro caso não tenha sido.

## 4. Nome de arquivo de áudio podia colidir entre coleções
Se duas coleções tivessem o mesmo nome, `main.py` gerava o mesmo nome
de arquivo `.mp3` para ambas, e uma sobrescrevia o áudio da outra.

**Corrigido:** o nome do arquivo agora inclui o ID da coleção
(`nome_da_colecao_<id>.mp3`).

## 5. Sem indicação de progresso/erro no fluxo de geração
Adicionei uma área de status ("Salvando coleção...", "Gerando áudio,
isso pode levar um tempo...", mensagens de erro) e desabilito os
controles da tela enquanto a geração está em andamento, para deixar
claro que o processo (que pode demorar) está rodando.

## Observação sobre dependências do ambiente
`pydub` depende do `ffmpeg` instalado no sistema para exportar em MP3, e
`pyttsx3` depende de um mecanismo de fala instalado no SO (`espeak` no
Linux, SAPI5 no Windows, NSSpeechSynthesizer no macOS). Isso não é um bug
de código — é preciso garantir que essas dependências de sistema estejam
instaladas no ambiente onde o programa vai rodar.

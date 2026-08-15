FLUXO PRINCIPAL DA APLICAÇÃO:

1. Usuário abre o programa.
2. O menu inicial apresenta as coleções existentes e a opção
   "Criar nova coleção".
3. Usuário cria uma coleção.
4. Usuário adiciona vários trechos de texto, mantendo uma ordem definida.
5. Usuário pode editar, excluir ou reordenar os trechos antes de concluir.
6. Ao clicar em "Concluir", o backend envia cada trecho para o mecanismo TTS.
7. Cada trecho é convertido temporariamente em áudio.
8. Os áudios são unidos na ordem definida pelo usuário.
9. O sistema adiciona uma pequena pausa entre os trechos.
10. O resultado é salvo como um único arquivo de áudio em data/audio/.
11. Os arquivos temporários utilizados durante o processo são removidos.
12. A coleção permanece salva em data/collections/ para poder ser editada
    ou regenerada posteriormente.
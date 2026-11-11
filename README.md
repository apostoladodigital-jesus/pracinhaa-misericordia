# Aliança de Misericórdia

Site estático em HTML, CSS e JavaScript, publicado pelo GitHub Pages.

## Publicar no GitHub Pages

1. Envie todos os arquivos deste projeto para a raiz do repositório, incluindo `index.html`, `assets/` e `.github/workflows/pages.yml`.
2. Para publicar gratuitamente pelo GitHub Pages, deixe o repositório público. Antes, confira se ele não contém senhas, chaves ou informações privadas.
3. No GitHub, abra **Settings > Pages** e, em **Build and deployment > Source**, selecione **GitHub Actions**.
4. Envie as alterações para a branch `main` ou `master`. O fluxo **Deploy static site to GitHub Pages** publicará o site automaticamente.
5. Acompanhe o resultado em **Actions**. Quando o fluxo terminar com sucesso, abra o endereço mostrado no job de deploy ou em **Settings > Pages**.

O arquivo `index.html` deve permanecer na raiz do repositório. Se ele estiver dentro de uma subpasta, o GitHub Pages não encontrará a página inicial e poderá mostrar 404.

## Arquivos do site

- `index.html`: estrutura e conteúdo.
- `style.css`: estilos e layout responsivo.
- `script.js`: comportamento do player e carregamento adiado do vídeo.
- `assets/`: vídeo institucional e logo.

# Ameopoema

Ameopoema é um site literário pessoal dedicado a haicais, poesias, textos e livros, construído como um site estático usando **Nunjucks** e hospedado no **GitHub Pages**.

O projeto prioriza simplicidade, leveza e controle total do conteúdo, sem backend ou dependências complexas.

---

## ✨ Características

- Site estático
- Templates com **Nunjucks (NJK)**
- Hospedagem gratuita via **GitHub Pages**
- Organização por seções (Haicais, Poesias, Textos, Livros)
- Sistema simples de bloqueio por senha (client-side)
- Layout responsivo com menu mobile
- Sem banco de dados
- Sem frameworks JavaScript

---

## 🔒 Bloqueio por senha

O site possui um **gate de acesso simples**, implementado diretamente no `base.njk`:

- A tela inicial solicita uma senha
- Apenas o título do site fica visível antes do acesso
- Links da navegação ficam ocultos até a liberação
- A senha é validada no navegador (JavaScript client-side)
- O acesso pode ser resetado manualmente clicando no copyright do footer

> ⚠️ Observação:  
> Este bloqueio é apenas visual e funcional para controle informal de acesso.  
> Não é um mecanismo de segurança real.
> A senha é: insegura

---
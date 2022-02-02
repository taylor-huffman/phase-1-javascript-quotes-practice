document.addEventListener('DOMContentLoaded', () => {
    let quoteList = document.getElementById('quote-list')
    let form = document.getElementById('new-quote-form')

    fetch('http://localhost:3000/quotes?_embed=likes')
    .then(res => res.json())
    .then(data => {
        data.forEach(item => {
            renderQuote(item)
        });
    })

    const createLiElement = (item) => {
        let li = document.createElement('li')
        li.classList.add('quote-card')

        let blockquote = document.createElement('blockquote')
        blockquote.classList.add('blockquote')

        let quote = document.createElement('p')
        quote.classList.add('mb-0')
        quote.textContent = item.quote

        let footer = document.createElement('footer')
        footer.classList.add('blockquote-footer')
        footer.textContent = item.author

        let br = document.createElement('br')

        let span = document.createElement('span')
        span.textContent = 0

        let likeButton = document.createElement('button')
        likeButton.classList.add('btn-success')
        likeButton.innerHTML = 'Likes: '
        likeButton.addEventListener('click', (e) => addLike(e, item))

        let editButton = document.createElement('button')
        editButton.classList.add('edit-button')
        editButton.textContent = 'Edit'
        editButton.addEventListener('click', (e) => editQuote(e))

        let deleteButton = document.createElement('button')
        deleteButton.classList.add('btn-danger')
        deleteButton.textContent = 'Delete'
        deleteButton.addEventListener('click', (e) => removeQuote(e, item))

        let editFormContainer = document.createElement('div')
        editFormContainer.id = 'edit-quote-form-container'
        editFormContainer.classList.add('hide')

        let editForm = document.createElement('form')
        editForm.id = 'edit-quote-form'

        let quoteLabel = document.createElement('label')
        quoteLabel.textContent = 'Quote'
        quoteLabel.setAttribute('for', 'edit-quote')

        let editQuoteInput = document.createElement('input')
        editQuoteInput.name = 'quote'
        editQuoteInput.id = 'edit-quote'
        editQuoteInput.classList.add('form-control')

        let authorLabel = document.createElement('label')
        authorLabel.textContent = 'Author'
        authorLabel.setAttribute('for', 'edit-author')

        let author = document.createElement('input')
        author.name = 'author'
        author.id = 'edit-author'
        author.classList.add('form-control')

        let submit = document.createElement('button')
        submit.type = 'submit'
        submit.classList.add('btn', 'btn-primary')
        submit.textContent = 'Submit'
        

        editForm.append(quoteLabel, editQuoteInput, authorLabel, author, submit)
        editFormContainer.appendChild(editForm)
        editForm.quote.value = item.quote
        editForm.author.value = item.author
        editForm.addEventListener('submit', (e) => submitEdit(e, item))

        likeButton.append(span)
        blockquote.append(quote, footer, br, likeButton, editButton, deleteButton)
        li.append(blockquote, editFormContainer)
        quoteList.appendChild(li)
    }

    const renderQuote = (item) => {
        createLiElement(item)
    }

    const editQuote = (e) => {
        let editContainer = e.target.parentNode.nextSibling
        editContainer.classList.toggle('hide')
    }

    const submitEdit = (e, item) => {
        e.preventDefault()
        console.log(e)
        let editQuoteForm = e.target
        e.target.parentNode.classList.add('hide')
        e.target.parentNode.parentNode.firstChild.firstChild.textContent = editQuoteForm.quote.value
        e.target.parentNode.parentNode.firstChild.firstChild.nextSibling.textContent = editQuoteForm.author.value
    }

    const addLike = (e, item) => {
        addLikeToDB(e, item)
    }

    const addLikeToDB = (e, item) => {
        console.log('add like to DB', item)
        fetch('http://localhost:3000/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteId: item.id,
                createdAt: Date.now()
            })
        })
            .then(res => res.json())
            .then(() => {
                let currentLikeCount = parseInt(e.target.firstElementChild.textContent)
                let span = e.target.firstElementChild
                span.textContent = currentLikeCount += 1
            })
    }

    const removeQuote = (e, item) => {
        removeQuoteFromDb(e, item)
    }

    const removeQuoteFromDb = (e, item) => {
        fetch(`http://localhost:3000/quotes/${item.id}`, {
            method: 'DELETE',
            headers: {
                'Conent-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(() => {
            e.target.parentNode.parentNode.remove()
        })
    }

    const createNewQuote = (e) => {
        e.preventDefault()
        let item = {
            quote: form.quote.value,
            author: form.author.value
        }
        addQuoteToDB(item)
        form.reset()
    }

    const addQuoteToDB = (item) => {
        fetch('http://localhost:3000/quotes', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body:JSON.stringify(item)
        })
        .then(res => res.json())
        .then(quote => createLiElement(quote))
    }

    form.addEventListener('submit', createNewQuote)
})
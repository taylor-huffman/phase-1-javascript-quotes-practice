document.addEventListener('DOMContentLoaded', () => {
    let quoteList = document.getElementById('quote-list')
    let form = document.getElementById('new-quote-form')
    let sortButton = document.getElementById('sort-button')

    const fetchQuotes = () => {fetch('http://localhost:3000/quotes?_embed=likes')
    .then(res => res.json())
    .then(data => {
        data.forEach(item => {
            createLiElement(item)
        });
    })
    }
    fetchQuotes()

    const createLiElement = (item) => {
        let li = document.createElement('li')
        li.classList.add('quote-card')
        li.dataset.authorName = item.author
        li.dataset.quoteIdNumber = item.id

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
        span.textContent = showLikeCount(item)

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

    const showLikeCount = (item) => {
        if (item.likes.length === 0) {
            return 0
        } else {
            return item.likes[0].likeCount
        }
    }

    const editQuote = (e) => {
        let editContainer = e.target.parentNode.nextSibling
        editContainer.classList.toggle('hide')
    }

    const submitEdit = (e, item) => {
        e.preventDefault()
        let editQuoteForm = e.target

        fetch(`http://localhost:3000/quotes/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                quote: editQuoteForm.quote.value,
                author: editQuoteForm.author.value
            })
        })
        .then(res => res.json())
        .then(() => {
            e.target.parentNode.classList.add('hide')
            e.target.parentNode.parentNode.firstChild.firstChild.textContent = editQuoteForm.quote.value
            e.target.parentNode.parentNode.firstChild.firstChild.nextSibling.textContent = editQuoteForm.author.value
        })
    }

    const addLike = (e, item) => {
        if (item.likes.length === 0) {
        fetch('http://localhost:3000/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteId: item.id,
                createdAt: Date.now(),
                likeCount: 1,
            })
        })
            .then(res => res.json())
            .then(() => {
                let quoteList = document.getElementById('quote-list')
                quoteList.innerHTML = ''
                fetchQuotes()
            })
        } else {
            fetch(`http://localhost:3000/likes?quoteId=${item.id}`)
            .then(res => res.json())
            .then((item) => {
                patchLike(e, item)
            })
        }
    }

    const patchLike = (e, item) => {
        let currentLikeCount = parseInt(e.target.firstElementChild.textContent)
        let span = e.target.firstElementChild
        span.textContent = currentLikeCount += 1
        fetch(`http://localhost:3000/likes/${item[0].id}`, {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                likeCount: currentLikeCount
            })
        })
        .then(res => res.json())
        .then(() => {
            span.textContent = currentLikeCount
        })
    }

    const removeQuote = (e, item) => {
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
        .then(() => {
            let quoteList = document.getElementById('quote-list')
            quoteList.innerHTML = ''
            fetchQuotes()
        })
    }

    let quoteArray = []

    setTimeout(function() {
        quoteArray = [...document.querySelectorAll('#quote-list li')]
}, 700)

    const sortFunction = () => {
        let quoteList = document.getElementById('quote-list')
        let alphebeticalArray = quoteArray.slice().sort(function(a, b) {
            let nameA = a.dataset.authorName
            let nameB = b.dataset.authorName
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        })
        
        
        if (sortButton.textContent === 'Turn Sort On') {
            sortButton.textContent = 'Turn Sort Off'
            quoteList.innerHTML = ''
            alphebeticalArray.forEach(quote => {
                quoteList.appendChild(quote)
        })
    } else {
            sortButton.textContent = 'Turn Sort On'
            quoteList.innerHTML = ''
            quoteArray.forEach(quote => {
                quoteList.appendChild(quote)
        })
    }
}
    


    sortButton.addEventListener('click', sortFunction)
    form.addEventListener('submit', createNewQuote)
})
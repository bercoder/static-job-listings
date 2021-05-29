const content = document.getElementById('content')
const filtersCont = document.querySelector('#filters')
const filtersDiv = document.querySelector('#filters > div')
const clearButton = document.querySelector('button.clear')
let dataJson = []
const filters = {
    role: null,
    level: null,
    languages: [],
    tools: []
}

const getData = async () => {
    try{
        const res = await fetch('../data.json')
        const data = await res.json()
        return data
    }
    catch(error){
        console.error(error)
    }
}

const Article = ( data ) => {
    const {position, featured, logo, company, postedAt, contract, location,
        role, level, languages, tools } = data
    const isNew = data.new
    return `
        <article ${featured ? `class="featured"` : ''}>
            <div>
                <div class="avatar">
                    <img width="48px" src="${logo}" alt="${position} avatar" />
                </div>
                <div class="company">
                    <h3>${company}</h3>
                    <div>
                        ${isNew ? `<span class="new">New!</span>` : ''}
                        ${featured ? `<span class="featured">Featured</span>` : ''}
                    </div> 
                </div>
                <h2>${position}</h2>
                <ul class="details">
                    <li>${postedAt}</li>
                    <li>${contract}</li>
                    <li>${location}</li>
                </ul>
            </div>
            <div class="tags-container">
                <ul class="tags">
                    <li data-type="role">${role}</li>
                    <li data-type="level">${level}</li>
                    ${languages.map(item => `<li data-type="languages">${item}</li>`).join('')}
                    ${tools.map(item => `<li data-type="tools">${item}</li>`).join('')}
                </ul>
            </div>
        </article>`
}

const addFilter = tagButton => {
    filtersCont.style.display = 'flex'

    if (!isElement(tagButton.innerHTML)) 
    {
        const div = createElement('div')
        const text = createElement('span', tagButton.innerHTML)
        const close = createElement('span', 'X', 'close')
        
        const type = tagButton.getAttribute('data-type')

        close.addEventListener('click', () => {

            if (type === 'languages' || type === 'tools'){
                filters[type] = filters[type].filter( item => item !== tagButton.innerHTML)
            } else {
                filters[type] = null
            }

            div.addEventListener('animationend', () => {
                filtersDiv.removeChild(div)
                if (!filtersDiv.childElementCount) {
                    filtersCont.style.display = 'none'
                }
            }, false)

            div.classList.add('fadeOut')

            filter()
        })

        div.append(text)
        div.append(close)

        filtersDiv.append(div)

        if (type === 'languages' || type === 'tools'){
            filters[type] = [...filters[type], tagButton.innerHTML]
        } else {
            filters[type] = tagButton.innerHTML
        }

        filter()
    }
    else{
        tagButton.addEventListener('animationend', () => {
            tagButton.classList.remove('clic')
        }, false)
        tagButton.classList.add('clic')
    }
}

function createElement(element, content = null, nameClass = null) {
    const el = document.createElement(element)
    if (content) el.append(document.createTextNode(content))
    if (nameClass) el.classList.add(nameClass)

    return el
}

function isElement(tag){
    return filters.role === tag
        || filters.level === tag
        || filters.languages.includes(tag) 
        || filters.tools.includes(tag)
}

const filter = (data = dataJson) => {
    const filtered = data.filter( el => {
        const role = filters.role ? filters.role === el.role : true
        const level = filters.level ? filters.level === el.level : true
        const languages = filters.languages.length ? filters.languages.every(item => el.languages.includes(item)) : true
        const tools = filters.tools.length ? filters.tools.every(item => el.tools.includes(item)) : true
    
        return role && level && languages && tools
    })

    render(filtered)
}

const render = data => {
    const articles = data.map(art => Article(art)).join('')
    content.innerHTML = articles

    const tags = document.querySelectorAll('ul.tags > li')
    
    tags.forEach(tag => {
        tag.addEventListener('click', () => addFilter(tag))
    })
}

clearButton.addEventListener('click', () => {
    for(let div of filtersDiv.children){
        div.addEventListener('animationend', () => {
            filtersDiv.removeChild(div)
            if (!filtersDiv.childElementCount) {
                filtersCont.style.display = 'none'
                filter()
            }
        }, false)

        div.classList.add('fadeOut')
    }
    
    filters.role = null,
    filters.level = null,
    filters.languages = [],
    filters.tools = []
})

const init = async () => {
    dataJson = await getData()
    render(dataJson)
}

window.onload = () => init()
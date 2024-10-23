const toggleButton = document.querySelector('#toggle-btn');
const sidebar = document.querySelector('#sidebar')


function toggleSideBar(){
    sidebar.classList.toggle('closeSide')

    closeAllSubMenus()
}


function toggleSubMenu(button){

    if(!button.nextElementSibling.classList.contains('show')){
        closeAllSubMenus()
    }
    
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if(sidebar.classList.contains('closeSide')){
        sidebar.classList.toggle('closeSide')
        toggleButton.classList.toggle('rotate')
    }
}

function closeAllSubMenus(){
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show')
    })
}


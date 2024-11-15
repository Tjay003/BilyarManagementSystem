const toggleButton = document.querySelector('#toggle-btn');
const sidebar = document.querySelector('#sidebar');

function toggleSideBar(){
    sidebar.classList.toggle('closeSide');
    closeAllSubMenus();
}

function toggleSubMenu(button){
    if(sidebar.classList.contains('closeSide')){
        sidebar.classList.remove('closeSide');
        setTimeout(() => {
            if(!button.nextElementSibling.classList.contains('show')){
                closeAllSubMenus();
            }
            button.nextElementSibling.classList.toggle('show');
            button.classList.toggle('rotate');
        }, 300);
        return;
    }

    if(!button.nextElementSibling.classList.contains('show')){
        closeAllSubMenus();
    }
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');
}

function closeAllSubMenus(){
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show');
    });
    Array.from(sidebar.getElementsByClassName('rotate')).forEach(button => {
        if (button !== toggleButton) {
            button.classList.remove('rotate');
        }
    });
}


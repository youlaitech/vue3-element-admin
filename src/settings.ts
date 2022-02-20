interface DefaultSettings {
    title: string,
    showSettings: boolean,
    tagsView: boolean,
    fixedHeader: boolean,
    sidebarLogo: boolean,
    errorLog: string
}


const defaultSettings: DefaultSettings = {
    title: 'vue3-element-admin',
    showSettings: true,
    tagsView: true,
    fixedHeader: false,
    sidebarLogo: false,
    errorLog: 'production'
}

export default defaultSettings
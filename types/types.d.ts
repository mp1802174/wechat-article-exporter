export interface LoginAccount {
    uuid: string
    token: string
    nickname: string
    avatar: string
    fakeid: string
    expires: string
    err?: string
}

export interface LoginInfoResult {
    nick_name: string
    head_img: string
}

export interface BaseResp {
    err_msg: string
    ret: number
}

export interface StartLoginResult {
    base_resp: BaseResp
}

export interface ScanLoginResult {
    base_resp: BaseResp
    status: number
    acct_size: number
    binduin: string
}

export interface AccountInfo {
    type: 'account'
    alias: string
    fakeid: string
    nickname: string
    round_head_img: string
    service_type: number
    signature: string
    _loaded?: boolean
}

export interface AuthorInfo {
    type: 'author'
    nickname: string
    fakeid: string
}

export interface SearchBizResponse {
    base_resp: BaseResp
    list: AccountInfo[]
    total: number
}

export interface AppMsgPublishResponse {
    base_resp: BaseResp
    publish_page: string
}

export interface PublishListItem {
    publish_type: number
    publish_info: string
}

export interface PublishPage {
    featured_count: number
    masssend_count: number
    publish_count: number
    publish_list: PublishListItem[]
    total_count: number
}

export interface PublishInfo {
    type: number
    new_publish: number
    msgid: number
    copy_type: number
    copy_appmsg_id: number
    appmsg_info: AppMsgInfo[]
    appmsgex: AppMsgEx[]
}

export interface AppMsgInfo {
    appmsg_like_type: number
    appmsgid: number
    is_from_transfer: number
    is_pay_subscribe: number
    itemidx: number
    open_fansmsg: number
    share_type: number
    smart_product: number
}

export interface RGB {
    r: number
    g: number
    b: number
}

export interface AppMsgEx {
    aid: string
    appmsgid: number
    author_name: string
    ban_flag: number
    checking: number
    copyright_stat: number
    copyright_type: number
    cover: string
    cover_img?: string
    cover_img_theme_color?: RGB
    create_time: number
    digest: string
    has_red_packet_cover: number
    is_deleted: boolean
    is_pay_subscribe: number
    item_show_type: number
    itemidx: number
    link: string
    media_duration: string
    mediaapi_publish_status: number
    pic_cdn_url_1_1: string
    pic_cdn_url_3_4: string
    pic_cdn_url_16_9: string
    pic_cdn_url_235_1: string
    title: string
    update_time: number
}

export interface DownloadableArticle {
    title: string
    url: string
    date: number
    html?: string
    packed?: boolean
}

export interface LogoutResponse {
    statusCode: number
    statusText: string
}

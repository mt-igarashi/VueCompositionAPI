export interface Movie {
    id?:string,
    title?:string,
    releaseDate?:string,
    genre?:string,
    price?:number,
    rating?:string
};

export interface Dialog {
    title?:string,
    message?:string,
    ok?:Function,
    cancel?:Function,
    show?:boolean,
    type?:string
}

export interface Message {
    errors:string[],
    messages:string[]
}

export interface Step {
    title:string,
    message:string
}

export interface LinkParam {
    state:string
}

export interface LinkPage {
    id:string,
    number:number
}

export interface GridColumn {
    id?:string,
    type?:string,
    class?:string,
    headertype?:string,
    title?:string,
    style?:string,
    frozen?:boolean,
    position?:string,
    converter?:Function,
    headerbuttons?:GridButton[],
    buttons?:GridButton[]
}

export interface GridButton {
    value:string,
    class:string,
    style:string
}

export interface GridItem {
    id:any
}

export interface MovieSearchData {
    genre:string,         // 検索条件：ジャンル
    searchString:string,  // 検索条件：タイトル
    genres:any[],         // ジャンルドロップダウン
    movies:Movie[],        // 映画一覧
    total:number,          // 総件数(ページング用)
    messages:Message,      // メッセージリスト
    loading:boolean,       // ローディング表示フラグ
    window:any,            // 映画編集画面用Windowオブジェクト
    dialog:Dialog,         // ダイアログパラメータ
    step:number,           // 現在のステップ
    steps:Step[],          // ステップ表示用オブジェクト
    fadeIn:boolean,        // ステップフェードイン
    fadeOut:boolean        // ステップフェードアウト
}

export interface MovieEditData {
    movie:Movie,        // 映画エンティティ
    messages:Message  // メッセージ
    loading: false,     // ローディング表示用フラグ
    dialog:Dialog,      // ダイアログパラメータ
    step: number,       // 現在のステップ
    steps:Step[]        // ステップ表示用オブジェクト
}

export interface MovieCreateData {
    movie:Movie,      // 映画エンティティ
    messages:Message, // メッセージ
    loading:boolean,  // ローディング表示フラグ
    dialog:Dialog,   // ダイアログパラメータ
    step:number,      // 現在のステップ
    steps:Step[],     // ステップ表示用オブジェクト
    disable:boolean   // 入力項目非活性フラグ
}

export interface MovieDetailData {
    movie:Movie,       // 映画エンティティ
    messages:Message,  // メッセージ
    loading:boolean    // ローディング表示用フラグ
}

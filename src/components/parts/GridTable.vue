<template>
  <div v-if="items && items.length > 0" class="gridtable-wrapper" :style="tableStyle">
  <table class="gridtable">
    <thead>
      <tr>
        <template v-for="(column, index) in columns" :key="column.id">
        <th :class="getHeaderClass(column)"
            :style="getStyle(column)"
            @click.prevent="headerclick($event, index)">
          <template v-if="index == 0 && column.headertype == 'checkbox'">
            <input type="checkbox"
                   :id="getGridHcbId(0, index)"
                   :name="getGridHcbName(index)"
                   class="gridhcb"
                   @change.prevent="headercheckclick($event, index)">
          </template>
          <template v-else-if="column.headertype == 'button'">
            <template v-if="column.headerbuttons && column.headerbuttons.length > 0">
              <template v-for="button in column.headerbuttons" :key="button.value">
                <input type="button"
                      :class="button.class"
                      :style="button.style"
                      :value="button.value"
                      @click.prevent="headerbuttonclick($event, button.value, index)">
              </template>
            </template>
          </template>
          <template v-else>
            {{column.title}}
          </template>
        </th>
        </template>
      </tr>
    </thead>
    <tbody>
      <template v-for="(item, rowindex) in items" :key="item.id">
      <tr @click.prevent="rowclick($event, rowindex)">
        <template v-for="(column, colindex) in columns" :key="column.id">
        <td :class="getColumnClass(column)"
            :style="getStyle(column)"
            @click.prevent="cellclick($event, rowindex, colindex)">
          <template v-if="colindex == 0 && column.type == 'checkbox'">
            <FieldValidator :field="`${column.id}_${rowindex}`" css="gridcb" :tooltip="true" :validator="validator">
              <template v-slot:control="slotProps">
              <input type="checkbox"
                     :id="getGridCbId(rowindex, colindex)"
                     :name="getGridCbName(colindex)"
                     :class="slotProps.executor.css">
              </template>
            </FieldValidator>
          </template>
          <template v-else-if="column.type == 'button'">
            <template v-if="column.buttons && column.buttons.length > 0">
              <template v-for="button in column.buttons" :key="button.value">
                <input type="button"
                      :class="button.class"
                      :style="button.style"
                      :value="button.value"
                      @click.prevent="buttonclick($event, button.value, rowindex, colindex)">
              </template>
            </template>
          </template>
          <template v-else-if="column.type == 'link'">
            <a href="#" @click.prevent="linkclick($event, rowindex, colindex)">{{item[column.id]}}</a>
          </template>
          <template v-else>
            <template v-if="column.converter">
              {{column.converter(item[column.id], item)}}
            </template>
            <template v-else>
              {{item[column.id]}}
            </template>
          </template>
        </td>
        </template>
      </tr>
      </template>
    </tbody>
  </table>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUpdate, onUpdated } from "vue";
import Validator from "@/js/validator";
import { GridItem, GridColumn } from "@/js/commonType";

/*
 * 概要：emit定義
 */
interface GridEmits {
  (event:"header-check-click", htmlEvent:Event, colindex:number):void;
  (event:"header-button-click", htmlEvent:Event, value:string, colindex:number):void;
  (event:"header-click", htmlEvent:Event, colindex:number):void;
  (event:"row-click", htmlEvent:Event, rowindex:number):void;
  (event:"cell-click", htmlEvent:Event, rowindex:number, colindex:number):void;
  (event:"check-click", htmlEvent:Event, checked:boolean, rowindex:number, colindex:number):void;
  (event:"button-click", htmlEvent:Event, value:string, rowindex:number, colindex:number):void;
  (event:"link-click", htmlEvent:Event, rowindex:number, colindex:number):void;
}
const emit = defineEmits<GridEmits>();

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // カラム定義
    columns: {
      type: Array<GridColumn>,
      default: []
    },

    // 一覧表示用配列
    items: {
      type: Array<GridItem>,
      default:[]
    },

    // テーブルスタイル
    tableStyle: {
      type: String,
      default: ""
    },

    // バリデータ
    validator: {
      type: Validator,
      default: new Validator([], {validation: []})
    }
  });

/*
 * 概要: ライフサイクルイベント
 */
  /*
   * 関数概要: コンポーネント描画前処理
   */
  onBeforeUpdate(():void => {
    for (let i = 0; i < props.columns.length; i++) {
      const column = props.columns[i];
      if (column.type == "checkbox") {
        let hcb = document.querySelector(`#${getGridHcbId(0, i)}`) as HTMLInputElement;
        if (!hcb) {
          return;
        }
        hcb.checked = false;
      }
    }
    props.validator.initializeMessegeStore(true);
  });

/*
   * 関数概要: コンポーネント描画後処理
   */
  onUpdated(():void => {
    addCheckboxEvent();
    let scroll = document.querySelector(".gridtable-wrapper");
    if (!scroll) {
      return;
    }
    scroll.scrollLeft = 0;
    scroll.scrollTop = 0;
    window.scrollTo(0, 0);
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */

  /*
   * 関数概要: ヘッダーに適用するClassを返却します。
   * 引数：column カラム定義
   */
  const getHeaderClass = (column:GridColumn):string[] => {      
      let cl = [];
      if (column.frozen) {
        cl.push("frozen-header");
      }

      if (column.type == "checkbox") {
        cl.push(" checkable");
      }
      return [cl.join(" "), column.class];
  };

  /*
   * 関数概要: カラムに適用するClassを返却します。
   * 引数：column カラム定義
   */
  const getColumnClass = (column:GridColumn):string[] => {
      let cl = [];
      if (column.frozen) {
        cl.push("frozen-column");
      }

      if (column.type == "checkbox") {
        cl.push("checkable");
      }
      return [cl.join(" "), column.class];
  };

  /*
   * 関数概要: カラムに適用するstyleを返却します。
   * 引数：column カラム定義
   */
  const getStyle = (column:GridColumn):string[] => {      
      let style = "";
      if (column.position) {
        style = `left: ${column.position}`;
      }
      return [style, column.style];
  };

  /*
   * 関数概要: ヘッダーチェックボックスのIDを返却します。
   * 引数：rowindex 行インデックス、colindex 列インデックス
   */
  const getGridHcbId = (rowindex:number, colindex:number):string => {
    return `gridhcb${rowindex}${colindex}`;
  };

  /*
   * 関数概要: ヘッダーチェックボックスのname属性を返却します。
   * 引数：colindex 列インデックス
   */
  const getGridHcbName = (colindex:number):string => {
    return `gridhcb${colindex}`;
  };

  /*
   * 関数概要: 一覧チェックボックスのIDを返却します。
   * 引数：rowindex 行インデックス、colindex 列インデックス
   */
  const getGridCbId = (rowindex:number, colindex:number):string => {
    return `gridcb${rowindex}${colindex}`;
  };

  /*
   * 関数概要: 一覧チェックボックスのname属性を返却します。
   * 引数：colindex 列インデックス
   */
  const getGridCbName = (colindex:number):string => {
    return `gridcb${colindex}`;
  };

  /*
   * 関数概要: チェックボックスにchangeイベントを追加します。
   */
  const addCheckboxEvent = ():void => {
    for (let colindex = 0; colindex < props.columns.length; colindex++) {
      const column = props.columns[colindex];
      if (column.type == "checkbox") {
        const cbList = document.querySelectorAll(`[name="${getGridCbName(colindex)}"]`) as NodeListOf<HTMLInputElement>;
        for (let rowindex = 0; rowindex < cbList.length; rowindex++) {
          let cb = cbList[rowindex];
          cb.onchange = (event) => {
            checkclick(event, cb.checked, rowindex, colindex);
            props.validator.validateField(`${column.id}_${rowindex}`);
          };
        }
      }
    }
  };

  /*
   * 関数概要: ヘッダークリックイベントを実行します。
   * 引数：event イベント、colindex 列インデックス
   */
  const headerclick = (event:Event, colindex:number):void => {
    const column = props.columns[colindex];
    if (column.headertype == "checkbox") {
      let hcb = document.querySelector(`#${getGridHcbId(0, colindex)}`) as HTMLInputElement;
      if (!hcb) {
        return;
      }
      hcb.checked = !hcb.checked;
      
      let cbList = document.querySelectorAll(`[name="${getGridCbName(colindex)}"]`) as NodeListOf<HTMLInputElement>;
      for (const cb of cbList) {
        cb.checked = hcb.checked;
        cb.onchange(event);
      }
      emit("header-check-click", event, hcb.checked, props.items, colindex);
    }
    emit("header-click", event, props.items, colindex);
  };

  /*
   * 関数概要: 行クリックイベントを実行します。
   * 引数：event イベント、rowindex 行インデックス
   */
  const rowclick = (event:Event, rowindex:number):void => {
    emit("row-click", event, props.items[rowindex], rowindex);
  };

  /*
   * 関数概要: セルクリックイベントを実行します。
   * 引数：event イベント、rowindex 行インデックス、colindex 列インデックス
   */
  const cellclick = (event:Event, rowindex:number, colindex:number):void => {    
    const column = props.columns[colindex];
    if (column.type == "checkbox") {
      let cb = document.querySelector(`#${getGridCbId(rowindex, colindex)}`) as HTMLInputElement;
      if (!cb) {
        return;
      }
      cb.checked = !cb.checked;
      cb.onchange(event);

      let hcb = document.querySelector(`#${getGridHcbId(0, colindex)}`) as HTMLInputElement;
      if (!hcb) {
        return;
      }
      
      const cbList = document.querySelectorAll(`[name="${getGridCbName(colindex)}"]`) as NodeListOf<HTMLInputElement>;
      let allChecked = true;
      for (const cb of cbList) {
        if (!cb.checked) {
          allChecked = false;
          break;
        }
      }
      hcb.checked = allChecked;
    }
    emit("cell-click", event, props.items[rowindex], rowindex, colindex);
  };

  /*
   * 関数概要: ヘッダーチェックボックスクリックイベントを実行します。
   * 引数：event イベント、colindex 列インデックス
   */
  const headercheckclick = (event:Event, colindex:number):void => {
    const elem = event.target as HTMLInputElement;
    if (!elem) {
      return;
    }
    emit("header-check-click", event, elem.checked, props.items, colindex);
  };

  /*
   * 関数概要: 一覧チェックボックスクリックイベントを実行します。
   * 引数：event イベント、checked チェック/未チェック、rowindex 行インデックス、colindex 列インデックス
   */
  const checkclick = (event:Event, checked:boolean, rowindex:number, colindex:number):void => {    
    if (props.items.length == 0) {
      return;
    }
    emit("check-click", event, checked, props.items[rowindex], rowindex, colindex);
  };

  /*
   * 関数概要: ヘッダーボタンクリックイベントを実行します。
   * 引数：event イベント、value ボタン名、colindex 列インデックス
   */
  const headerbuttonclick = (event:Event, value:string, colindex:number):void => {
    emit("header-button-click", event, props.items, value, colindex);
  };

  /*
   * 関数概要: 一覧ボタンクリックイベントを実行します。
   * 引数：event イベント、value ボタン名、rowindex 行インデックス、colindex 列インデックス
   */
  const buttonclick = (event:Event, value:string, rowindex:number, colindex:number):void => {    
    if (props.items.length == 0) {
      return;
    }
    emit("button-click", event, props.items[rowindex], value, rowindex, colindex);
  };

  /*
   * 関数概要: 一覧リンククリックイベントを実行します
   * 引数：event イベント、rowindex 行インデックス、colindex 列インデックス
   */
  const linkclick = (event:Event, rowindex:number, colindex:number):void => {
    if (props.items.length == 0) {
      return;
    }
    emit("link-click", event, props.items[rowindex], rowindex, colindex);
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* テーブル */
.gridtable {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

/* ヘッダー */
.gridtable thead th {
  text-align:center;
  background:#005baa;
  font-weight: bold;
  color:#fff;
  padding: 7px 6px 6px 6px;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  border: 1px solid #eee;
  z-index: 1;
}

/* ボディ項目・フッター項目 */
.gridtable tbody th,
.gridtable tfoot th {
  background:#fff;
}

/* ボディデータ・フッターデータ */
.gridtable tbody td,
.gridtable tfoot td {
  text-align:center;
  padding: 6px;
  background: #fff;
}

/* 偶数行１行ごとの色変えが不要なら削除 */
.gridtable tr:nth-child(2n) th,
.gridtable tr:nth-child(2n) td  {
  background: #FBFBF6;
}

/* ヘッダー枠線 */
.gridtable thead .checkable::before {
  content: "";
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

/* ボディデータ・フッターデータ(枠線) */
.gridtable tbody td,
.gridtable tfoot td {
  border: 1px solid #eee;
}

/* セル枠線 */
.gridtable tbody .checkable::before {
  content: "";
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

/* ヘッダー列固定 */
.gridtable .frozen-header {
  /* 横スクロール時に固定する */
  position: -webkit-sticky;
  position: sticky;
  z-index: 3;
}

/* セル列固定 */
.gridtable .frozen-column {
  /* 横スクロール時に固定する */
  position: -webkit-sticky;
  position: sticky;
  z-index: 1;
}

.gridtable tbody tr td:first-of-type {
  z-index: 2;
}

/* スクロール領域 */
.gridtable-wrapper {
  overflow: auto;
}
</style>

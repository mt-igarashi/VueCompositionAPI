<template>
  <span class="question float-right mr-4">
    <img alt="説明" width="20" height="20" src="../../assets/small_question.png" @click.prevent="showAnswer">
  </span>
  <div v-if="data.show" class="count-container">
    <span class="square_btn" name="square_btn" @click.prevent="hideAnswer"></span>
    <ul class="count-list">
      <li id="count-title" v-html="title"></li>
      <template v-for="message in messages" :key="message">
        <li v-html="message"></li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

/*
 * 概要: データプロパティ
 * (リアクティブデータ。変更がUIに即時反映される)
 */
  const data = reactive({
    show: false  // クエスチョン表示フラグ
  });

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // 項目説明タイトル
    title: {
      required: true,
      type: String,
      default: ""
    },

    // 作成ポイント説明メッセージ
    messages: {
      required: true,
      type: Array,
      default: new Array()
    }
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */
  /*
   * 関数概要: コンポーネントを表示します。
   */
  const showAnswer = ():void => {
    (document.querySelectorAll(".square_btn") as NodeListOf<HTMLButtonElement>).forEach(x => {
      x.click();
    });
    data.show = true;
  };

  /*
   * 関数概要: コンポーネントを非表示にします。
   */
  const hideAnswer = ():void => {
    data.show = false;
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.question {
  position: relative;
}

.count-container {
  position: absolute;
  left: 55%;
  z-index: 4;
} 
.count-list {
  counter-reset: chapter;
}

#count-title {
  background-color: #fffafa;
}

#count-title:before {
  content: "説明項目" ;
  width: 50px;
  height: 50px;
  margin: 0 5px 0 0;
  padding:5px 10px;
  border-radius: 20px;
  background-color: palevioletred;
  color: #fff;
  counter-reset: chapter;
}

.count-list li:before {
  content: "POINT "counter(chapter) ;
  counter-increment: chapter;
  width: 50px;
  height: 50px;
  margin: 0 5px 0 0;
  padding:5px 10px;
  border-radius: 20px;
  background-color: #30b0d8;
  color: #fff;
}
.count-list li {
  padding: 10px;
  background-color: #cde2e8;
  text-align: left;
  color: #34282C;
  white-space: pre;
  list-style: none;
  font-weight: lighter;
}

.count-list li:nth-child(odd) {
  background-color: #eee;
}

.square_btn {
  display: block;
  position: relative;
  left: 38px;
  width: 30px;
  height: 30px;
  border: 2px solid #333; /* 枠の調整 */
  background: #fff; /* ボタンの背景色 */
}
 
.square_btn::before, .square_btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px; /* 棒の幅（太さ） */
  height: 27px; /* 棒の高さ */
  background: #333; /* バツ印の色 */
}
 
.square_btn::before {
  transform: translate(-50%,-50%) rotate(45deg);
}
 
.square_btn::after {
  transform: translate(-50%,-50%) rotate(-45deg);
}

a img{
  border: none;
}
</style>

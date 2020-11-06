// const createTextFromTemplate = (title, url, template) => {
//   let txt = template;

//   txt = txt.replace(/%%title%%/g, title);
//   txt = txt.replace(/%%URL%%/g, url);
//   return txt;
// }
// function createBoard(boardTitle) {
//   axios({
//     method: "POST",
//     url: "https://sinapse-20201015.herokuapp.com/api/boards/",
//     data: {
//       title: boardTitle,
//       description: "",
//       thumbnail: "",
//       url_tail: "",
//       is_published: true,
//       // user_idを取得するためにログインしてもらう必要があるね
//       user_id: 1
//       // "tagList": [ "気候変動", "地球温暖化", "自然電力" ]
//       // tagList: this.convertTaglistToTags
//     },
//   })
//     .then((res) => {
//       console.log(res);
//       return res.data.id
//     })
//     .catch(() => {});
// }

async function getAllTabsInfo(tabs) {
  let cards = []

  const boardTitle = document.querySelector('#board-title').value
  console.log(boardTitle);
  const boardDescription = document.querySelector('#board-description').value
  console.log(boardDescription);


  // const boardId = await createBoard(boardTitle)
  const boardId = await axios({
    method: "POST",
    url: "https://sinapse-20201015.herokuapp.com/api/boards/",
    data: {
      title: boardTitle,
      description: boardDescription,
      thumbnail: "",
      url_tail: "",
      is_published: true,
      // user_idを取得するためにログインしてもらう必要があるね
      user_id: 1
      // "tagList": [ "気候変動", "地球温暖化", "自然電力" ]
      // tagList: this.convertTaglistToTags
    },
  })
    .then((res) => {
      console.log(res);
      return res.data.id
    })
    .catch(() => { });

  let i = 0

  for await (tab of tabs) {
  // tabs.forEach((tab, i) => {
    // if (i != 0) txt += delimiter;  //最初は区切り文字不要
    // console.log(tab.title + " " + tab.url);
    // txt += createTextFromTemplate(tab.title, tab.url, template);
    await axios({
      method: "POST",
      url: "https://sinapse-20201015.herokuapp.com/api/cards/",
      data: {
        url: tab.url,
        title: tab.title,
        summary: "",
        thumbnail: "",
        position_x: 450,
        position_y: i * 300 + 100,
        board: boardId,
      },
    })
      .then((res) => {
        console.log(res);
        const cardId = res.data.id
        cards.push(cardId)
        axios({
          method: "POST",
          url: "https://sinapse-20201015.herokuapp.com/api/scrape/",
          data: {
            url: res.data.url,
          },
        })
          .then((res) => {
            console.log(res);
            axios({
              method: "PATCH",
              url: "https://sinapse-20201015.herokuapp.com/api/cards/" + cardId + "/",
              data: {
                // url: res.data.url,
                title: res.data.soup_title,
                summary: res.data.soup_desc,
                thumbnail: res.data.soup_img,
                // position_x: parseInt(this.node.x),
                // position_y: parseInt(this.node.y),
                // board_idはread_onlyにして送信しないようにしたい
                // board: parseInt(this.$route.params.id),
              },
            })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch(() => {
            console.log('申し訳ございません。まだ対応していないサイト構造です。');
            // window.alert('申し訳ございません。まだ対応していないサイト構造です。')
          });
      })
      .catch((err) => {
        console.log(err);
      });
  // })
    i++
  }
  console.log('koko');
  console.log(cards);
  return {
    "boardId": boardId,
    "cards": cards
  }
}



// const run = () => {}

function saveToBoard() {
  //現在のウインドウのタブをすべて取得
  chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, async (tabs) => {
    // let txt = '';
    // const delimiter = '\n';  //区切り文字
    // const template = '[%%title%%](%%URL%% \"%%title%%\")'; //テンプレ

    const result = await getAllTabsInfo(tabs)
    const cards = result.cards
    const boardId = result.boardId

    // document.querySelector('#txt').value = txt;
    for (let index = 1; index < cards.length; index++) {
      const element = cards[index];

      axios({
        method: "POST",
        url: "https://sinapse-20201015.herokuapp.com/api/arrows/",
        data: {
          from_card: cards[index] - 1,
          from_position: 'bottom',
          to_card: cards[index],
          to_position: 'top',
          arrow_type: 1,
          label: "",
          board_id: boardId
        }
      })
        .then((res) => {
          console.log(res);
        })
        .catch(() => {});
    }

  // const copyText = document.querySelector('#save-to-board');
  // copyText.select();
  // document.execCommand('copy');
  })
}

window.addEventListener('load', () => {
  // run();
  document.querySelector("#save-to-board").addEventListener("click", saveToBoard);
})

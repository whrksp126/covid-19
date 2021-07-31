import React from "react";
// 배열 관리, 패치 api 사용
import { useState, useEffect } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import axios from "axios";

const Contents = () => {
  // state 의 조각인 useState 로 confirmedData 를 하나 추가함
  // 첫번째는 데이터 명, 두번째는 set 데이터 명을 작성함
  // state 의 () 괄호 안에 초기값을 넣어둘 수 있음
  const [confirmedData, setConfirmedData] = useState({});

  // 격리자를 추가히기 위해 useState를 하나더 추가함
  const [quarantinedData, setQuarantinedData] = useState({});

  //
  const [conparedData, setComparedData] = useState({});

  // 클래스에서 마운트가 됐을 때 바로 메서드를 실행하는 효과를 주기 위해 사용
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await axios.get(
        "https://api.covid19api.com/total/dayone/country/kr"
        // async 와 await 를 사용해서 api 데이터를 다 받아온 후 다음 줄 코드를 리딩(실행) 한다
      );
      makeData(res.data); // data 배열을 넘겨줌
    };
    const makeData = (items) => {
      // 각 월의 마지막 날짜의 확진자만 있으면됨 그걸 redus 를 통해서 만들어 봄
      // 첫번째 인자는 쌓여서 계속 다음 반복문으로 넘겨지는 전달 값
      // 두번째 인자는 현재 반복문을 돌고 있는 그 아이템 값 입니다
      const arr = items.reduce((acc, cur) => {
        // 현재의 날짜를 담아서 변환을 시킨다
        const currentDate = new Date(cur.Date);
        // 년 월 일을 추출 한다
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = currentDate.getDate();
        // 데이터 객체 안에 각각의 키 값을 변수에 담아두고 사용함
        const confirmed = cur.Confirmed;
        const active = cur.Active;
        const death = cur.Death;
        const recovered = cur.Recovered;

        // 데이터를 변수화 해서 추출했으니 새로운 배열(로직)을 만듬
        // 첫번째로는 반복문때마다 추척시켜서 넣기고 있는 배열에 값이 들어있는지 안들어 있는지 확인을 할 것이다.
        // 만약에 년 월에 해당하는 값이 배열안에 안들어 있다고 하면 push (새로 추가)를 할거고
        // 들어 있다고 하면 날짜를 비교해서 큰 날짜꺼만 저장되도록 만듬

        // find 메서드를 통해 들어있는지 없는지 찾아봄
        // a 를 인자로 넣기고 a 에 year 가 변수로 선언한 year 와 같고
        // 그리고 a 에 month 가 변수로 선언한 month 와 같다고 하면 그게 우리가 원하는 아이템일 것이다.
        const findItem = acc.find((a) => a.year === year && a.month === month);

        // 아이템이 없다고 하면 배열에 push 를 시켜 주는 로직을 추가함
        if (!findItem) {
          // 변수로 선언한 year, month, date, confirmed, active, death, recovered 를 보냄
          acc.push({ year, month, date, confirmed, active, death, recovered });
        }
        // 만약에 아이템이 있고 아이템의 date 가 현재의 날짜보다 작으면 새로 업데이트를 해주는 내용을 추가함
        if (findItem && findItem.date < date) {
          findItem.active = active;
          findItem.death = death;
          findItem.date = date;
          findItem.year = year;
          findItem.month = month;
          findItem.confirmed = confirmed;
          findItem.recovered = recovered;
        }

        // 마지막으로 업데이트 된 cur을 넘겨주면 됨
        return acc;

        // 배열로 초기값을 지정함
      }, []);

      console.log(arr);

      const labels = arr.map((a) => `${a.month + 1}월`);
      setConfirmedData({
        labels,
        datasets: [
          {
            label: "국내 누적 확진자",
            backgroundColor: "salmon",
            fill: true,
            data: arr.map((a) => a.confirmed),
          },
        ],
      });

      setQuarantinedData({
        labels,
        datasets: [
          {
            label: "월별 격리자 현황",
            borderColor: "salmon",
            fill: false,
            data: arr.map((a) => a.active),
          },
        ],
      });
      const last = arr[arr.length - 1];
      setComparedData({
        labels: ["확진자", "격리해제", "사망"],
        datasets: [
          {
            label: "누적 확진, 해제, 사망 비율",
            backgroundColor: ["#ff3d67", "#059bff", "#ffc233"],
            borderColor: ["#ff3d67", "#059bff", "#ffc233"],
            fill: false,
            data: [last.confirmed, last.recovered, last.death],
          },
        ],
      });
    };
    fetchEvents();
    // 두번째 배열, 두번째 디펜던스를 넣어야지 계속 호출하는 현상을 방지할 수 있음
  }, []);
  return (
    <section>
      <h2>국내 코로나 현황</h2>
      <div className="contents">
        <div>
          <Bar
            data={confirmedData}
            options={
              ({
                title: {
                  display: true,
                  text: "누적 확진자 추이",
                  fontSize: 16,
                },
              },
              { legend: { display: true, position: "bottom" } })
            }
          />
        </div>

        <div>
          <Line
            data={quarantinedData}
            options={
              ({
                title: {
                  display: true,
                  text: "월별 격리자 현황",
                  fontSize: 16,
                },
              },
              { legend: { display: true, position: "bottom" } })
            }
          />
        </div>

        <div>
          <Doughnut
            data={conparedData}
            options={
              ({
                title: {
                  display: true,
                  text: `누적 확진, 해제, 사망 (${
                    new Date().getMonth() + 1
                  }월)`,
                  fontSize: 16,
                },
              },
              { legend: { display: true, position: "bottom" } })
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Contents;

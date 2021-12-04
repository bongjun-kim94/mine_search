import React, { useEffect, useReducer, createContext, useMemo } from 'react';
import Table from './Table';
import Form from './Form';

export const CODE = {
    MINE: -7,
    NORMAL: -1,
    QUESTION: -2,
    FLAG: -3,
    QUESTION_MINE: -4,
    FLAG_MINE: -5,
    CLICKED_MINE: -6,
    OPENED: 0, // 0 이상이면 다 OPENED
};

// 다른 파일에서 쓸 수 있게 export
export const TableContext = createContext({
    tableData: [],
    halted: true,
    dispatch: () => {},
});

const initialState= {
    tableData: [],
    // 초기 세팅에 대한 데이터
    data: {
        row: 0,
        cell: 0,
        mine: 0,
    },
    timer: 0,
    result: '',
    halted: false,
    openedCount: 0,
};

// tableData에 지뢰를 심는 함수
const plantMine = (row, cell, mine) => {
    console.log(row, cell, mine);
    // 0~99까지의 숫자
    const candidate = Array(row * cell).fill().map((arr, i) => {
        return i;
    });
    const shuffle = [];
    while (candidate.length > row * cell - mine) {
        const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0];
        shuffle.push(chosen);
    }
    const data = [];
    // 2차원배열 생성
    for (let i = 0; i < row; i++) {
        const rowData = [];
        data.push(rowData);
        for (let j = 0; j < cell; j++) {
            rowData.push(CODE.NORMAL);
        }
    }
    // 몇 , 몇 , 인지 계산 하는 코드
    for (let k = 0; k < shuffle.length; k++) {
        const ver = Math.floor(shuffle[k] / cell);
        const hor = shuffle[k] % cell;
        data[ver][hor] = CODE.MINE;
    }
    return data;
};

export const START_GAME = 'START_GAME';
export const OPEN_CELL = 'OPEN_CELL';
export const CLICK_MINE = 'CLICK_MINE';
export const FLAG_CELL = 'FLAG_CELL';
export const QUESTION_CELL = 'QUESTION_CELL';
export const NORMALIZE_CELL = 'NORMALIZE_CELL';
export const INCREMENT_TIMER = 'INCREMENT_TIMER';

const reducer = (state, action) => {
    switch (action.type) {
        case START_GAME:
            return {
                ...state,
                // 배열보단 객체로 해야지 속성의 이름을 붙일수 있음
                // data: [action.row, action.cell, action.mine],
                data: {
                    row: action.row,
                    cell: action.cell,
                    mine: action.mine,
                },
                openedCount: 0,
                tableData: plantMine(action.row, action.cell, action.mine),
                halted: false,
                timer: 0,
            };
        case OPEN_CELL: {
            const tableData = [...state.tableData];
            // tableData[action.row] = [...state.tableData[action.row]];
            tableData.forEach((row, i) => {
                tableData[i] = [...state.tableData[i]];
            });
            const checked = [];
            let openedCount = 0;
            // 내 기준으로 검사하는 함수, 주변칸의 지뢰개수를 검사하는 함수
            // row, cell은 매개변수화를 시켰기 때문에 action 제거
            const checkAround = (row, cell) => {
                // 닫힌 칸이 아닌경우 한 번에 열리면 안되니까 걸러줌
                if ([CODE.OPENED, CODE.FLAG_MINE, CODE.FLAG, CODE.QUESTION_MINE, CODE.QUESTION].includes(tableData[row][cell])) {
                    return;
                }
                // 상하좌우 칸이 아닌 경우 필터링
                if (row < 0 || row >= tableData.length || cell < 0 || cell >= tableData[0].length) {
                    return;
                }
                // 닫힌 칸만 열기
                if (checked.includes(row + ',' + cell)) { // 이미 검사한 칸이면
                    return;
                } else {
                    // 한번 연 칸은 무시하기
                    checked.push(row + ',' + cell);
                }
                // 주변칸들 지뢰개수 셈
                let around = [
                    tableData[row][cell - 1], tableData[row][cell + 1],
                ];
                // 내 기준에서 셀의 윗 줄
                if (tableData[row - 1]) {
                    around = around.concat(tableData[row - 1][cell - 1], tableData[row - 1][cell], tableData[row - 1][cell + 1]);
                }
                // 내 기준에서 셀의 아랫줄
                if (tableData[row - 1]) {
                    around = around.concat(tableData[row + 1][cell - 1], tableData[row + 1][cell], tableData[row + 1][cell + 1]);
                }
                const count = around.filter((v) => [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)).length;
                tableData[row][cell] = count;
                // 내가 빈 칸이면 주변을 다 검사, 주변칸 모아서 주변칸들 열어주는 것
                if (count === 0) { // 주변칸 오픈
                    const near = [];
                    // 제일 윗칸이 없을때
                    if (row - 1 > -1) {
                        near.push([row - 1, cell - 1]);
                        near.push([row - 1, cell]);
                        near.push([row - 1, cell + 1]);
                    }
                    near.push([row, cell - 1]);
                    near.push([row, cell + 1]);
                    // 제일 아랫칸이 없을때 그 것들 없애주는 것
                    if (row + 1 > tableData.length) {
                        near.push([row + 1, cell - 1]);
                        near.push([row + 1, cell]);
                        near.push([row + 1, cell + 1]);
                    }
                    near.forEach((n) => {
                        // 이미 연 칸이 아니면 필터링, 주변칸도 닫혀있을 경우에만 오픈
                        if (tableData[n[0][n[1]] !== CODE.OPENED]) {
                            checkAround(n[0], n[1]);
                        }
                    })
                }
                // 지금 내 칸이 닫힌 칸이면 카운트 증가
                if (tableData[row][cell] === CODE.NORMAL) {
                    // 칸들 하나 열릴때마다 카운터 + 1
                    openedCount += 1;
                }
                tableData[row][cell] = count;
            };
            // 내 기준으로 검사를 해서 
            checkArround(action.row, action.cell);
            // 승리조건 체크
            let halted = false;
            let result = '';
            if (state.data.row * state.data.cell - state.data.mine === state.openedCount + openedCount) { // 승리
                halted = true; // 게임을 멈추고
                result = `${state.timer}초 만에 승리하셨습니다.`;
            }
            return {
                ...state,
                tableData,
                openedCount: state.openedCount + openedCount,
                halted,
                result,
            };
        }
        case CLICK_MINE: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = CODE.CLICKED_MINE;
            return {
                ...state,
                tableData,
                halted: true,
            };
        }   
        case FLAG_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            if (tableData[action.row][action.cell] === CODE.MINE) {
              tableData[action.row][action.cell] = CODE.FLAG_MINE;
            } else {
              tableData[action.row][action.cell] = CODE.FLAG;
            }
            return {
              ...state,
              tableData,
            };
        }
        case QUESTION_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            if (tableData[action.row][action.cell] === CODE.FLAG_MINE) {
              tableData[action.row][action.cell] = CODE.QUESTION_MINE;
            } else {
              tableData[action.row][action.cell] = CODE.QUESTION;
            }
            return {
              ...state,
              tableData,
            };
        }
        case NORMALIZE_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            if (tableData[action.row][action.cell] === CODE.QUESTION_MINE) {
              tableData[action.row][action.cell] = CODE.MINE;
            } else {
              tableData[action.row][action.cell] = CODE.NORMAL;
            }
            return {
              ...state,
              tableData,
            };
        }
        case INCREMENT_TIMER : {
            return {
                ...state,
                timer: state.timer + 1,
            }
        }
        default:
            return state;
    }
};

const MineSearch = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { tableData, halted, timer, result } = state;
    // state.tableData가 변경될 때 갱신
    const value = useMemo(() => ({ tableData: tableData, halted, dispatch }), [tableData, halted]);

    useEffect = (() => {
        if (halted === false) {
            const timer = setInterval(() => {
                dispatch({ type: INCREMENT_TIMER });
            }, 1000); // 1초마다 timer가 증가
        }
        return () => {
            clearInterval(timer);
        }
    }, [halted]);

    return (
        <>
            <TableContext.Provider value={value}>
                <Form />
                <div>{timer}</div>
                <Table />
                <div>{result}</div>
            </TableContext.Provider>
        </>
    )
};

export default MineSearch;
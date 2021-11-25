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
    timer: 0,
    result: '',
    halted: false,
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

const reducer = (state, action) => {
    switch (action.type) {
        case START_GAME:
            return {
                ...state,
                tableData: plantMine(action.row, action.cell, action.mine)
            };
        case OPEN_CELL:
            const tableData = [...state.tableData];
            // tableData[action.row] = [...state.tableData[action.row]];
            tableData.forEach((row, i) => {
                tableData[i] = [...state.tableData[i]];
            });
            // 내 기준으로 검사하는 함수
            // row, cell은 매개변수화를 시켰기 때문에 action 제거
            const checkArround = (row, cell) => {
                let around = [];
                // 내 기준에서 셀의 윗 줄
                if (tableData[row - 1]) {
                    around = around.concat(
                        tableData[row - 1][cell - 1],
                        tableData[row - 1][cell],
                        tableData[row - 1][cell + 1],
                    );
                }
                // 내 기준에서 좌우
                around = around.concat(
                    tableData[row][cell - 1],
                    tableData[row][cell + 1],
                );
                // 내 기준에서 셀의 아랫줄
                if (tableData[row - 1]) {
                    around = around.concat(
                        tableData[row + 1][cell - 1],
                        tableData[row + 1][cell],
                        tableData[row + 1][cell + 1],
                    );
                }
                const count = around.filter((v) => [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)).length;
                tableData[row][cell] = count;
                // 내가 빈 칸이면 주변을 다 검사
                if (count === 0) {
                    const near = [];
                    if (row - 1 > -1) {
                        near.push([row - 1, cell - 1]);
                        near.push([row - 1, cell]);
                        near.push([row - 1, cell + 1]);
                    }
                    near.push([row, cell - 1]);
                    near.push([row, cell + 1]);
                    if (row - 1 > -1) {
                        near.push([row + 1, cell - 1]);
                        near.push([row + 1, cell]);
                        near.push([row + 1, cell + 1]);
                    }
                } else {
                    
                }
            };
            // 내 기준으로 검사를 해서 
            checkArround(action.row, action.cell);
            return {
                ...state,
                tableData,
            };
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
        default:
            return state;
    }
};

const MineSearch = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    // state.tableData가 변경될 때 갱신
    const value = useMemo(() => ({ tableData: state.tableData, dispatch }), [state.tableData]);

    return (
        <>
            <TableContext.Provider value={value}>
                <Form />
                <div>{state.timer}</div>
                <Table />
                <div>{result}</div>
            </TableContext.Provider>
        </>
    )
};

export default MineSearch;
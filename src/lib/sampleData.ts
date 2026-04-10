export interface DataPoint {
  label: string;
  value: number;
}

export const sampleCsv = `week,sales
1,12400
2,13100
3,12800
4,14200
5,13900
6,15100
7,14800
8,16200
9,15800
10,16900
11,17200
12,18100
13,17800
14,18900
15,19200
16,20100
17,19800
18,9200
19,20400
20,21100
21,22800
22,24100
23,26400
24,28900`;

export const sampleData: DataPoint[] = sampleCsv
  .trim()
  .split("\n")
  .slice(1)
  .map((row) => {
    const [label, value] = row.split(",");

    return {
      label: `Week ${label}`,
      value: Number(value),
    };
  });

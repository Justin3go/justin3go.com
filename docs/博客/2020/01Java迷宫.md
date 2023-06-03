# Java迷宫

最近这学期做了一个java迷宫的课程设计，这里代码及其算法逻辑就分享出来。

首先简单的说一下其中我使用的算法（自动生成地图：递归分割法、递归回溯法；寻找路径：深度优先、广度优先算法）

递归分割法：

地图外面一圈被墙围住，然后在空白区域生成十字墙壁，再随机选择三面墙，将其打通，这样就能保证迷宫的流动性，再分别对刚才分好的四个区域以同样的方式执行分割，一直递归下去，直到空间不足以分割就return。

![image-20221021150944828](https://oss.justin3go.com/blogs/image-20221021150944828.png)

递归回溯法：

**递归回溯法与深度优先算法在大致算法上其实差不多，具体只有一些细微的差别，都是通过判断当前点的是四个方向是否可以通过，当某个点堵住就向上退一步操作。递归回溯法具体算法如下：**

**（****1****）初始化，建立一个所有单元格都被墙隔开的迷宫。**

**（****2****）从起点开始，以此单元格开始打通墙壁。**

**（****3****）以当前单元格为基准，随机选择一个方向，若此方向的邻接单元格没有被访问过，则打通这两个单元格之间的墙壁，并将此单元格作为当前单元格，重复步骤****3.**

**（****4****）若当前单元格之间的四个邻接单元格都已经被访问过，则退回到进入当前单元格的邻接单元格，且以此单元格为当前单元格，重复步骤****3****、****4****。**

**（****5****）直至起始点单元格被退回，则算法结束。**

**深度优先算法和递归回溯差不太多，只是把邻接单元格变为的相邻的单元格，就直接是探寻周围是否有路可走，而不再是打通墙壁了。**

广度优先：以步骤为主导，向四周扩散，比如第一步往四周走一格，第二步就四周的那几个单元格再往他们的四周走一格，一直下去，直到找到终点为止，这样返回的就是步骤数，同时因为这是遍历了整个地图，所以找到的一定是最短的路径。

![image-20221021151022288](https://oss.justin3go.com/blogs/image-20221021151022288.png)

深度优先：以路径为主导，一直找下去，如果堵住了或者遇到已经访问过的，就返回上一格，随机另一条路继续下去，直到找到终点为止，这种方式找到的路并不是最短的，仅仅提供一条路径而已。

![image-20221021151038972](https://oss.justin3go.com/blogs/image-20221021151038972.png)

**下面是递归分割法、递归回溯法以及文件加载地图实现的类map**：//注意看注释，不然可能会看不懂，稍微有点乱

递归分割法：RandomMap1(),genMaze(),OpenADoor()//这三种方法实现，1加载的后面两种方法，2实现十字分割，3实现打开两点为一线之间的一堵墙。

递归回溯法：RandomMap2(),list(),digMaze()//这三种方法实现，1加载的后面两种方法，2连接两格单元格，即把中间的单元格变为通路，3实现如果往下没路可走就返回一个单元格进行继续找路。

文件加载地图：FileMap()方法

```java
package migong;

import java.util.Random;
import java.util.Scanner;
import java.util.Stack;
import java.io.File;


public class Map{
	Random r = new Random();
	int l1,l2;
	int x,y;//在回溯法中代表当前点
	boolean bool2 = true;//使用在getMaze()与list()方法中
	//判断是否执行了第二个if，如果都没执行，说明当前点的相邻点要么被访问过了，要么在边界之外，就需要退一步
	Map(int l1, int l2){
		this.l1 = l1;
		this.l2 = l2;
	}
	Stack<Integer> steps = new Stack<>();
	
	public int[][] RandomMap2(int l1, int l2){//递归回溯法自动生成迷宫
		//规定0是墙，1是路，2是已经被探寻过的单元，也可以看做路
		int [][] map = new int[l1][l2];
		for(int i = 1;i < l1; i = i + 2) {//初始化迷宫生成所有单元都被墙隔开的迷宫
			for(int j = 1; j < l2;j = j + 2) {
				map[i][j] = 1;
				map[j][i] = 1;
			}
		}
		map[1][1] = 2;
		digMaze(1,1,map);
		return map;
	}	
	public boolean list(int x, int y, int[][] map) {//(x,y)代表当前单元格，初始单元格为起点
		this.x = x;
		this.y = y;
		int isOpen = r.nextInt(4);//0代表左边，逆时针旋转
		boolean bool1 = true;
//判断第一个if是否执行，如果四个都没执行，就递归在执行一次，因为有可能随机产生的数过大，把非边界路就已经给排除了
		
		//分别判断相邻四个点（x,y-2）（x+2,y）（x,y+2）（x-2,y）
		switch(isOpen) {
		case 0:{
			if((this.y-2) > 0 && (this.y- 2) < l2 - 1) {
				bool1 = false;
				if(map[this.x][this.y-2] == 1) {
					map[this.x][this.y-2] = 2;//表示这个点被访问了
					map[this.x][this.y-1] = 1;//打通墙壁
					this.y = this.y - 2;//改变当前点
					bool2 = false;
					steps.push(0);					
				}
			}		
		}
		case 1:{
			if((this.x+2) > 0 && (this.x+2) < l1 -1) {
				bool1 = false;
				if(map[this.x+2][this.y] == 1) {
					map[this.x+2][this.y] = 2;
					map[this.x+1][this.y] = 1;
					this.x = this.x + 2;
					bool2 = false;
					steps.push(1);
				}
			}
		}
		case 2:{
			if((this.y+2) > 0 && (this.y+2) < l2 - 1) {
				bool1 = false;
				if(map[this.x][this.y+2] == 1) {
					map[this.x][this.y+2] = 2;
					map[this.x][this.y+1] = 1;
					this.y = this.y + 2;
					bool2 = false;
					steps.push(2);
				}
			}			
		}
		case 3:{
			if((this.x-2) > 0 && (this.x-2) < l1 -1) {
				bool1 = false;
				if(map[this.x-2][this.y] == 1) {
					map[this.x-2][this.y] = 2;
					map[this.x-1][this.y] = 1;
					this.x = this.x - 2;
					bool2 = false;
					steps.push(3);
				}
			}
		}
		default:{
			if(bool1) {
				list(this.x,this.y,map);
			}
			}
		}
		return bool2;
	}
	public void digMaze(int x, int y, int[][] map) {
		this.x = x;
		this.y = y;
		this.bool2 = true;
		//不能将bool2定义在list方法中，因为递归调用它会让其变为true但后面switch并不会到第二层if中
		//从而这条注释下面的if就会判断失误

		if(list(this.x,this.y,map)) {
			try {
				switch((int)steps.pop()) {//当当前点的下一点全都被访问了就执行退回操作
				case 0:{
					y = y + 2;
					break;
				}
				case 1:{
					x = x -2;
					break;
				}
				case 2:{
					y = y - 2;
					break;
				}
				case 3:{
					x = x + 2;
				}
				default:
				}
			}catch(Exception ex) {
				return;
			}
		}
		
//		if(x == l1 - 2 && y == l2 - 2){//判断是否到达终点(l1-2,l2-2)
//			return;
//		}
//		if(map[l1-3][l2-2] == 1 && map[l1-2][l2-3] == 1) {
//			return;
//		}
		if(steps.empty()) {//当起始点操作被退回是结束递归，这样生成的地图对比上面两种要更好些
			return;
		}
		digMaze(this.x,this.y,map);
	}
	
	public int[][] RandomMap1(int l1, int l2){//递归分割法自动生成迷宫
		int [][] map = new int[l1][l2];
//0代表墙，1代表路
		for(int i = 1; i < l1 - 1; i++) {
			for(int j = 1; j < l2 - 1; j++) {
				map[i][j] = 1;
			}
		}

		genMaze(1,1,l1,l2,map);		
		return map;
	}	
	private void openAdoor(int x1, int y1, int x2, int y2, int[][] map) {
		//以传参的两点为直线，打开这条线的某一点,分割的点存在于x1~(x2-1)或y1~(y2-1)
		int pos;//打开的那一点
		
		if(x1 == x2) {
			pos = y1 + r.nextInt((int)((y2 - y1)/2 + 1))*2;//在奇数行开门
			map[x1][pos] = 1;
		}
		else if(y1 == y2) {
			pos = x1 + r.nextInt((int)((x2 - x1)/2 + 1))*2;//在奇数列开门
			map[pos][y1] = 1;
		}
		else {
			System.out.println("错误");
		}
	}
	//x,y代表要分割区域的左上点坐标,l1代表的行数，l2代表的列数
	public void genMaze(int x, int y, int l1, int l2, int[][] map) {
		int Xpos, Ypos;
		
		if(l1 <= 3 || l2 <= 3)
			return;

		//Xpos,Ypos只能取（x或y，l - 1）之间的偶数，这里是开区间
		//横着画线，在偶数位置画线,
		Xpos = x + r.nextInt((int)(l1/2) - 1)*2 + 1;//Xpos,Ypos相当于两条分割线交叉点的坐标
			for(int i = y; i < y + l2 - 2;i++) {
				map[Xpos][i] = 0;
			}		
		//竖着画一条线，在偶数位置画线
		Ypos = y + r.nextInt((int)(l2/2) - 1)*2 + 1;
			for(int i = x; i < x + l1 - 2;i++) {
				map[i][Ypos] = 0;
			}
		
		//随机开三扇门，左侧墙壁为1，逆时针旋转
		int isClosed = r.nextInt(4) + 1;
		switch (isClosed) 
        {
        case 1://1开234门，依次下去
            openAdoor(Xpos + 1, Ypos, x + l1 - 2, Ypos, map);// 2
            openAdoor(Xpos, Ypos + 1, Xpos, y + l2 - 2, map);// 3
            openAdoor(x, Ypos, Xpos, Ypos, map);// 4
            break;
        case 2:
            openAdoor(Xpos, Ypos + 1, Xpos, y + l2 - 2, map);// 3
            openAdoor(x, Ypos, Xpos, Ypos, map);// 4
            openAdoor(Xpos, y, Xpos, Ypos, map);// 1
            break;
        case 3:
            openAdoor(x, Ypos, Xpos, Ypos, map);// 4
            openAdoor(Xpos, y, Xpos, Ypos, map);// 1
            openAdoor(Xpos + 1, Ypos, x + l1 - 2, Ypos, map);// 2
            break;
        case 4:
            openAdoor(Xpos, y, Xpos, Ypos, map);// 1
            openAdoor(Xpos + 1, Ypos, x + l1 - 2, Ypos, map);// 2
            openAdoor(Xpos, Ypos + 1, Xpos, y + l2 - 2, map);// 3
            break;
        default:
            break;
        }
		//左上角
		genMaze(x, y, Xpos + 2 - x, Ypos + 2 - y, map);
		//右上角
		genMaze(x, Ypos + 1, Xpos + 2 - x, l2 - Ypos, map);
		//左下角
		genMaze(Xpos + 1, y, l1 - Xpos, Ypos + 2 - y, map);
		//右下角
		genMaze(Xpos + 1, Ypos + 1, l1 - Xpos , l2 - Ypos, map);
	}
	
	public static int[][] FileMap(String filename) throws Exception{//手动生成迷宫的方法
		//读取没有空格的数字方阵
		File file = new File(filename);
		if(!file.exists()) {
			System.out.println("文件不存在");
		}		
		Scanner input = new Scanner(file);				
		int l1 = 0, l2 = 0;//l1代表行数，l2代表列数
		String[] str = new String[1024];
		while(input.hasNext()) {
			str[l1++] = input.nextLine();//获取行数同时把每一行分别赋给str数组的各个元素		
		l2 = str[0].length();
		}
		int [][]map = new int[l1][l2];
		for(int i = 0;i < l1;i++) {
			for(int j = 0; j < l2;j++) {
				map[i][j] = str[i].charAt(j) - '0';//通过两个Ascll码之差获得其数值
//				map[i][j] = Integer.parseInt(str[i].charAt(j) + "");
			}
		}
		input.close();
		return map;
	}
	
	public void show(int[][] map,int l1,int l2) {
		for(int i = 0; i < l1; i++) {
			for(int j = 0; j < l2; j++) {
				System.out.print(map[i][j] + " ");
			}
			System.out.println("\n");
		}
	}	
	
	public static void main(String[] args) throws Exception{
//		String filename = "C:\\Users\\21974\\Desktop\\map.txt";
//		for(int i = 0; i < 2; i++) {
//			for(int j = 0; j < 4; j++) {
//				System.out.print(Map.FileMap(filename)[i][j] + " ");
//			}
//			System.out.println("\n");
//		}
		
		int l1 = 15,l2 = 15;//奇数
		Map m = new Map(l1, l2);
		m.show(m.RandomMap1(l1, l2),l1,l2);	
	}
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

下面是深度优先与广度优先的类findpath：


```java
package migong;

import java.util.LinkedList;
import java.util.Stack;

public class findPath {
	public LinkedList<GPS> steps1 = new LinkedList<>();
	public Stack<Integer> steps2 = new Stack<>();
	int x,y;
	public boolean bool = true;
	//判断是否执行了第二个if，如果都没执行，说明当前点的相邻点是墙，要么被访问过了，要么在边界之外，就需要退一步
	
	public String shortestPath(int[][] map,int l1, int l2){//最优路径
		//创建一个方向数组,方向的优先级为 "下左上右"
		 Direction[] di = new Direction[] {new Direction(1,0),new Direction(0,-1),new Direction(-1,0),new Direction(0,1)};
		 
		 //创建一个字符数组,其中DLUR分别表示向下、向上、向左、向右走。
		 StringBuffer[] step = new StringBuffer[] {new StringBuffer("D"),new StringBuffer("L"),new StringBuffer("U"),new StringBuffer("R")};
		 		 		 
	     //创建一个标识符,判断迷宫是否有解
	     boolean b = false;
				                      
        int x=1,y=1,stepNumber=0;
        String startStep = "";//代表空,没有操作
        GPS temp = new GPS(x,y,stepNumber,startStep);  //将起始点的信息加入队列
        map[x][y] = 2;                              //将当前位置标记为已经走过
        steps1.addLast(temp);
        
        Loop:while(!steps1.isEmpty()) {
       	 
       	 temp = steps1.poll() ;    //弹出队头元素进行扩展
       	 
       	 for(int i=0;i<4;i++) {    //按照优先级"下左上右",依次进行扩展
       		 int row = temp.x + di[i].inc_x;
       		 int col = temp.y + di[i].inc_y;
       		StringBuffer ts = step[i]; //当前方向的字母表示//当前方向的字母表示
       		 
       		 if(map[row][col] == 1) {
       			 int tempStepNumber = temp.stepNumber+1;
       			String tempStepPath = temp.stb + ts;  
       			 steps1.addLast(new GPS(row,col,tempStepNumber,tempStepPath)); //符合条件的坐标加入队列
       			 
       			 map[row][col] = 2;   //将该结点的值设为2,扩展该结点
       			 
       			 if(row == l1-2 && col == l2-2) {  //判断是否到达了终点
       				 b = true;
       				 break Loop;        //跳出标记所在的循环
       			 }
       		 }
       	 }     	             	 
        }
        if(b) {
        	return steps1.getLast().stb;
        }else {return "无解";}
	}
	public void sMove(int x, int y, int[][] map) {
		
	}
	
	public Stack<Integer> path(int x, int y, int[][] map){//深度优先自动寻路
		map[1][1] = 3;
		searchMaze(x,y,map);
		return this.steps2;
	}
	public boolean move(int x, int y,int[][] map){									
			//分别判断相邻四个点（x,y-1）（x+1,y）（x,y+1）（x-1,y）
			switch(0) {//0代表左，逆时针
			case 0:{
				if((this.y-1) > 0 && (this.y- 1) < map[0].length - 1) {
					if(map[this.x][this.y-1] == 1 || map[this.x][this.y-1] == 2) {
//0代表墙，1代表路，2代表生成迷宫时被访问了的路，在这里也相当于路，3代表这里找路时被访问了的路						
						map[this.x][this.y-1] = 3;//标明改点已经走过了						
						this.y = this.y - 1;//改变当前点
						bool = false;
						steps2.push(0);
						break;
					}
				}		
			}
			case 1:{
				if((this.x+1) > 0 && (this.x+1) < map.length -1) {
					if(map[this.x+1][this.y] == 1 || map[this.x+1][this.y] == 2) {
						map[this.x+1][this.y] = 3;
						this.x = this.x + 1;
						bool = false;
						steps2.push(1);
						break;
					}
				}
			}
			case 2:{
				if((this.y+1) > 0 && (this.y+1) < map[0].length - 1) {
					if(map[this.x][this.y+1] == 1 || map[this.x][this.y+1] == 2) {
						map[this.x][this.y+1] = 3;
						this.y = this.y + 1;
						bool = false;
						steps2.push(2);
						break;
					}
				}			
			}
			case 3:{
				if((this.x-1) > 0 && (this.x-1) < map.length - 1) {
					if(map[this.x-1][this.y] == 1 || map[this.x-1][this.y] == 2) {
						map[this.x-1][this.y] = 3;
						this.x = this.x - 1;
						bool = false;
						steps2.push(3);
						break;
					}
				}
			}
			default:
			}				
		return bool;
	}
	public void searchMaze(int x, int y, int[][] map) {//这里是空返回，以后要调用栈直接用类名加数据名
		this.x = x;
		this.y = y;
		this.bool = true;
		if(move(this.x,this.y,map)) {
			try {
				switch((int)steps2.pop()) {//当当前点的下一点全都被访问了就执行退回操作
				case 0:{
					this.y = y + 1;
					break;
				}
				case 1:{
					this.x = x - 1;
					break;
				}
				case 2:{
					this.y = y - 1;
					break;
				}
				case 3:{
					this.x = x + 1;
				}
				default:
				}
			}catch(Exception ex) {
				return;
			}
		}
		
		if(map[map.length - 2][map[0].length - 2] == 3){//判断是否到达终点(l1-2,l2-2)
			return;
		}	
		searchMaze(this.x,this.y,map);
	}
	
	public void show(Stack<Integer> stack) {
		while(!stack.empty()) {
			System.out.println((int)stack.pop());
		}
	}
	public static void main(String[]args) {
		int l1 = 5,l2 = 5;
		
		Map m = new Map(l1,l2);
		findPath find = new findPath();
		
		int[][] map = m.RandomMap1(l1, l2);
//		String s = find.path(l1,l2,map);
//		System.out.println(s);
//		System.out.println("地图为");
//		m.show(map, l1, l2);
		find.path(1,1,map);
		System.out.println("路为");
		m.show(map, l1, l2);
		find.show(find.steps2);
	}
}
class Direction{
	int inc_x;   //x方向的增量
	int inc_y;   //y方向的增量
	
	public Direction(int inc_x,int inc_y) {
		this.inc_x = inc_x;
		this.inc_y = inc_y;
	}
}

/*
GPS类,成员变量x,y表示坐标,stepNumber表示步数
*/
class GPS{
	int x;
	int y;
	int stepNumber;
	String stb;    //用来记录路径
	
	public GPS(int x,int y,int stepNumber,String stb){
		this.x = x;
		this.y = y;
		this.stepNumber = stepNumber;
		this.stb = stb;
	}
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

能看到这里说明我的文章对你有所帮助，支持一下呗，第一次写博客有些还不够规范。


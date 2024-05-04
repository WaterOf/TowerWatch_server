import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bodyParser from 'body-parser'
// import CameraWebSocket from './socket_gpt';
import { spawn } from 'child_process'

//创建express实例
const mysqlserver = express();
let pythonProcess; // 用于存储Python进程的变量

// 跨域处理
mysqlserver.use(cors());
mysqlserver.use(bodyParser.json());
// 创建 MySQL 数据库连接池，连接池用于管理和复用数据库连接
const pool = mysql.createPool({
    connectionLimit: 100,
    host: '8.148.10.46',
    user: 'root',
    password: 'mysql_ZW7Grz',
    database: 'towerwatch'
});

// 获取告警信息id，类型，告警级别，告警时间，告警点位经纬度
mysqlserver.get('/api/WarnMsg', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT id,warnmsg_type_id,img_url,warn_time,cenlon,cenlat FROM warn_msg', (error, results) => {
            //使用获取到的数据库连接，执行一个 SQL 查询。这个查询从 warn_msg 表中选取多个字段。
            connection.release();//一旦查询完成，使用 release 方法将连接返回到连接池，这样其他代码可以复用该连接

            if (error) {
                console.error('Error fetching data from MySQL:', error);
                res.status(500).json({ error: 'Failed to retrieve data from MySQL' });
                return;
            }
            res.json(results);
        });
    });
});
//获取摄像头id，经纬度，地址，在离线状态，告警次数统计数据
mysqlserver.get('/api/CameraList', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT id,lon,lat,detailed_address,is_online,warn_amount FROM camera_list', (error, results) => {
            connection.release();

            if (error) {
                console.error('Error fetching data from MySQL:', error);
                res.status(500).json({ error: 'Failed to retrieve data from MySQL' });
                return;
            }
            //型3.5
            // 你可以继续问我：
            // 请问还有其他函数吗我该如何使用这个 Map 函数创建数组列表Texas Acads是什么语言
            //遍历 results 数组，并对每个元素执行一定的转换操作，以适应前端的显示需求
            const formattedResults = results.map(item => ({
                ...item,//将 item 的所有属性复制到新对象中
                id: item.id,
                lonlat: [item.lon, item.lat], // 将 lon 和 lat 合并为一个数组
                address: item.detailed_address, // 确保前端属性名称一致
                isOnline: item.is_online.toString(), // 确保数据类型一致（如果需要的话）
                warnCount: item.warn_amount
            }));

            res.json(formattedResults);//将结果以json格式返回
        });
    });
});
mysqlserver.get('/api/MapComp', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT cenlon,cenlat FROM warn_msg', (error, results) => {
            connection.release();

            if (error) {
                console.error('Error fetching data from MySQL:', error);
                res.status(500).json({ error: 'Failed to retrieve data from MySQL' });
                return;
            }

            res.json(results);
        });
    });
});
//获取未处理的告警信息
mysqlserver.get('/api/HandleWarnMsg', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT * FROM warn_msg where is_fixed = 0', (error, results) => {
            //使用获取到的数据库连接，执行一个 SQL 查询。这个查询从 warn_msg 表中选取多个字段。
            connection.release();//一旦查询完成，使用 release 方法将连接返回到连接池，这样其他代码可以复用该连接

            if (error) {
                console.error('Error fetching data from MySQL:', error);
                res.status(500).json({ error: 'Failed to retrieve data from MySQL' });
                return;
            }

            res.json(results);
        });
    });
});
//提交日志到数据库
mysqlserver.post('/api/HandlePost', (req, res) => {
    // 从请求体中获取数据
    const { name, time, detail, index } = req.body;

    // 创建数据库连接
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // 插入数据到数据库
        const insertQuery = 'INSERT INTO handle_msg (name, time, detail) VALUES (?, ?, ?)';
        connection.query(insertQuery, [name, time, detail], (err, insertResults) => {
            if (err) {
                connection.release();
                console.error('Error executing MySQL insert query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            console.log('Data inserted successfully:', insertResults);

            // 获取插入的数据的id
            const insertedId = index;

            // 更新另一个表的is_fixed字段为1
            const updateQuery = 'UPDATE warn_msg SET is_fixed = 1 WHERE id = ?';
            connection.query(updateQuery, [insertedId], (err, updateResults) => {
                // 释放数据库连接
                connection.release();

                if (err) {
                    console.error('Error executing MySQL update query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                console.log('Data updated successfully:', updateResults);
                res.status(200).send('Data inserted and updated successfully');
            });
        });
    });
});
//读取数据库中的日志
mysqlserver.get('/api/GetLog', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT * FROM handle_msg', (error, results) => {
            //使用获取到的数据库连接，执行一个 SQL 查询。这个查询从 handle_msg 表中选取多个字段。
            connection.release();//一旦查询完成，使用 release 方法将连接返回到连接池，这样其他代码可以复用该连接

            if (error) {
                console.error('Error fetching data from MySQL:', error);
                res.status(500).json({ error: 'Failed to retrieve data from MySQL' });
                return;
            }

            res.json(results);
        });
    });
});

mysqlserver.get('/start-python', (req, res) => {
    if (pythonProcess) {
        res.send('Python脚本已经在运行中');
    } else {
        // 启动Python文件
        pythonProcess = spawn('python', ['./video_detect.py']);
        // 接收Python文件输出的数据
        pythonProcess.stdout.on('data', (data) => {
            let result = data.toString('utf8'); // 将二进制数据转换为 UTF-8 编码的字符串
            result = result.replace(/'/g, '"'); // 将单引号替换为双引号
            try {
                const json = JSON.parse(result); // 解析 JSON 字符串
                const timestamp = parseInt(json.time * 1000);
                const date = new Date(timestamp);
                // 获取日期和时间的各个部分
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // 月份从0开始，所以需要加1
                const day = date.getDate();
                const formattedTime = `${year}-${month}-${day}`;
                // 调用CameraWebSocket类并在handleMessage函数中接收返回值
                // const cameraSocket = new CameraWebSocket('ws://192.168.21.4:58888');
                // let frameData = {
                //     "packettype": 4,
                //     "cameraid": 320000003,
                //     "timestamp": Date.now(),
                //     "type": 1,
                //     "coords": [{ "x": json.centerX, "y": json.centerY }]
                // };
                // cameraWS.send(frameData);
                // cameraSocket.socket.on('message', (message) => {
                //     const processedData = cameraSocket.handleMessage(message);
                //     // 在这里可以使用处理后的数据
                // });
                const typedict = {
                    "dozer": 0,
                    "excavator": 1,
                    "truck": 2,
                    // "person": 3,
                }
                pool.getConnection((err, connection) => {
                    if (err) {
                        console.error('Error connecting to MySQL:', err);
                        res.status(500).json({ error: 'Internal server error' });
                        return;
                    }
                    const data = {
                        img_url: json.img_url,
                        warnmsg_type_id: typedict[json.warn_type],
                        rtsp_url: "rtsp://admin:a8888888@192.168.2.5:554/h264/ch1/main/av_stream",
                        cenlon: json.centerX + 0,
                        cenlat: json.centerY + 0,
                        is_fixed: 0,
                        handle_time: null,
                        description: null,
                        tenant_id: null,
                        warn_time: formattedTime,
                        region_type: "耕地",
                        // 添加其他要插入的字段和对应的值
                    };
                    connection.query('INSERT INTO warn_msg SET ?', data, (error, results) => {
                        connection.release();
                        if (error) {
                            console.error('Error fetching data from MySQL:', error);
                            res.status(500).json({ error: 'Failed to retrieve data from MySQL' });
                            return;
                        }
                    });
                });
            } catch (error) {
                console.error('无效的 JSON 字符串:', result);
            }
        });

        // 处理Python文件的错误
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python错误：${data}`);
        });

        // 监听Python进程的关闭事件
        pythonProcess.on('close', (code) => {
            console.log(`Python进程已退出，退出码：${code}`);
            pythonProcess = null; // 将pythonProcess重置为null
        });

        res.send('Python脚本已启动');
    }
});

mysqlserver.get('/stop-python', (req, res) => {
    if (pythonProcess) {
        pythonProcess.kill(); // 终止Python进程
        pythonProcess = null; // 将pythonProcess重置为null
        res.send('Python脚本已停止');
    } else {
        res.send('Python脚本未在运行中');
    }
});

export default mysqlserver;
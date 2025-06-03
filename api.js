const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// 中间件配置
app.use(bodyParser.json()); // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析表单请求体

/**
 * GET接口示例
 * 路径: /api/getInfo
 * 参数: name (查询字符串)
 * 返回: JSON格式的欢迎信息
 */
app.get('/api/getInfo', (req, res) => {
    const name = req.query.name || '匿名用户';
    console.log(`收到GET请求，参数: ${name}`);
    res.json({
        code: 200,
        message: `你好, ${name}!`,
        data: {
            timestamp: Date.now()
        }
    });
});

/**
 * POST表单接口示例
 * 路径: /api/submitForm
 * 参数: username, password (表单格式)
 * 返回: 处理结果
 */
app.post('/api/submitForm', (req, res) => {
    const { username, password } = req.body;
    console.log(`收到表单POST请求，用户名: ${username}`);

    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码必填' });
    }

    res.json({
        code: 200,
        message: '表单提交成功',
        data: {
            username,
            receivedAt: new Date().toISOString()
        }
    });
});

/**
 * POST JSON接口示例
 * 路径: /api/submitJson
 * 参数: JSON格式 { userId, action }
 * 返回: 处理结果
 */
app.post('/api/submitJson', (req, res) => {
    const { userId, action } = req.body;
    console.log(`收到JSON POST请求，用户ID: ${userId}, 操作: ${action}`);

    if (!userId) {
        return res.status(400).json({ error: '用户ID必填' });
    }

    res.json({
        code: 200,
        message: '操作已接收',
        data: {
            userId,
            action,
            processedAt: Date.now()
        }
    });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API服务已启动，访问地址: http://localhost:${PORT}`);
    console.log('可用接口:');
    console.log(`1. GET请求: curl http://localhost:${PORT}/api/getInfo?name=张三`);
    console.log(`2. 表单POST: curl -X POST -d "username=test&password=123" http://localhost:${PORT}/api/submitForm`);
    console.log(`3. JSON POST: curl -X POST -H "Content-Type: application/json" -d '{"userId":"1001","action":"login"}' http://localhost:${PORT}/api/submitJson`);
});

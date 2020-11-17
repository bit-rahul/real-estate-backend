// Requirements
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs')
const bcrypt = require('bcrypt')
const { request } = require('express')
var current = {};

// We have to tell AdminBro that we will manage mongoose resources with it
AdminBro.registerAdapter(require('admin-bro-mongoose'))

// express server definition
const app = express()
app.use(bodyParser.json())

// Resources definitions
const User = mongoose.model('User', {
    email: { type: String, required: true },
    encryptedPassword: { type: String, required: true },
    role: { type: String, enum: ['admin', 'restricted'], required: true },
})

// Cars collection
const Cars = mongoose.model('Car', {
    name: String,
    color: { type: String, enum: ['black'], required: true }, // Henry Ford
    ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

// RBAC functions
const canEditCars = ({ currentAdmin, record }) => {
    return currentAdmin && (
        currentAdmin.role === 'admin'
        || currentAdmin._id === record.param('ownerId')
    )
}
const canModifyUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'

// Pass all configuration settings to AdminBro
const adminBro = new AdminBro({
    resources: [{
        resource: Cars,
        options: {
            properties: {
                ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
            },
            actions: {
                edit: { isAccessible: canEditCars },
                delete: { isAccessible: canEditCars },
                list: {
                    after: async (response, request, context) => {
                        // response.records.map((rec) => delete rec.id)
                        console.log(current._id)
                        let records = [];
                        response.records.map((rec) => {
                            // console.log(rec.id, "rec")
                            if (rec.params.ownerId == current._id)
                                records.push(rec);
                        })
                        response.records = records;
                        response.meta.total = records.length;
                        // console.log(response);
                        return response
                    }
                },
                new: {
                    before: async (request, { currentAdmin }) => {
                        // console.log("current", currentAdmin)
                        request.payload.record = {
                            ...request.payload.record
                        }
                        request.payload.ownerId = currentAdmin._id;
                        // console.log(request, "request")
                        return request
                    },
                }
            }
        }
    },
    {
        resource: User,
        options: {
            properties: {
                encryptedPassword: { isVisible: false },
                password: {
                    type: 'string',
                    isVisible: {
                        list: false, edit: true, filter: false, show: false,
                    },
                },
            },
            actions: {
                new: {
                    isAccessible: false
                },
                edit: { isAccessible: false },
                delete: { isAccessible: false },
                new: { isAccessible: false },
            }
        }
    }],
    rootPath: '/admin',
})

// Build and use a router which will handle all AdminBro routes
const router = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
        // console.log(email, password)
        const user = await User.findOne({ email })
        // console.log(user)
        if (user) {
            const matched = await bcrypt.compare(password, user.encryptedPassword)
            if (matched) {
                current = user;
                return user
            }
        }
        return false
    },
    cookiePassword: 'some-secret-password-used-to-secure-cookie',
})

app.use(adminBro.options.rootPath, router)

// Running the server
const run = async () => {
    await mongoose.connect('mongodb://localhost:27017/config', { useNewUrlParser: true })
    await app.listen(8080, () => console.log(`Example app listening on port 8080!`))
}

run()

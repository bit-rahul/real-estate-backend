const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('@admin-bro/express')
const bcrypt = require('bcryptjs')
AdminBro.registerAdapter(require('@admin-bro/mongoose'))
const Home = require('./models/Home')
const LandLord = require('./models/LandLord')
var current = {};

// / RBAC functions
const canModifyHomes = ({ currentAdmin, record }) => {
    return currentAdmin && (
        currentAdmin._id === record.param('landlordID')
    )
}

const canModifyLandLord = ({ currentAdmin, record }) => {
    return currentAdmin && (
        currentAdmin._id === record.param('_id')
    )
}
// Pass all configuration settings to AdminBro
const adminBro = new AdminBro({
    resources: [{
        resource: Home,
        options: {
            properties: {
                landlordID: { isVisible: { edit: false, show: true, list: true, filter: true } }
            },
            actions: {
                edit: { isAccessible: canModifyHomes },
                delete: { isAccessible: canModifyHomes },
                list: {
                    after: async (response, request, context) => {
                        let records = [];
                        response.records.map((rec) => {
                            if (rec.params.landlordID == current._id)
                                records.push(rec);
                        })
                        response.records = records;
                        response.meta.total = records.length;
                        return response
                    }
                },
                new: {
                    before: async (request, { currentAdmin }) => {
                        request.payload = {
                            ...request.payload,
                            landlordID: currentAdmin._id,
                        }
                        return request
                    },
                }
            }
        }
    },
    {
        resource: LandLord,
        options: {
            properties: {
                encryptedPassword: { isVisible: false },
                password: {
                    type: String,
                    isVisible: {
                        list: false, edit: true, filter: false, show: false,
                    },
                },
            },
            actions: {
                new: {
                    isAccessible: false
                },
                list: {
                    after: async (response, request, context) => {
                        let records = [];
                        response.records.map((rec) => {
                            if (rec.id == current._id)
                                records.push(rec);
                        })
                        response.records = records;
                        response.meta.total = records.length;
                        return response
                    }
                },
                edit: { isAccessible: canModifyLandLord },
                delete: { isAccessible: canModifyLandLord }
            }
        }
    }
    ],
    rootPath: '/admin',
    branding: {
        logo: 'https://res.cloudinary.com/dxceimqgz/image/upload/c_scale,w_50/v1605554724/realEstate/homes/logo_sg9dez.png',
        companyName: 'home',
        softwareBrothers: false
    }
})

module.exports = adminRouter = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
        const landlord = await LandLord.findOne({ email })
        if (landlord) {
            const matched = await bcrypt.compare(password, landlord.encryptedPassword)
            if (matched) {
                current = landlord;
                return landlord
            }
        }
        return false
    },
    cookiePassword: 'secret-password-used-to-secure-cookie',
})
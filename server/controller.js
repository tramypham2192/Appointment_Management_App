require('dotenv').config();
const {CONNECTION_STRING} = process.env;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    CONNECTION_STRING,
    {
        dialect: 'postgres',
        // dialectOptions: {
        // ssl: {
        //     rejectUnauthorized: false
        // }
        // }
    });

let nextEmp = 5

module.exports = {
    getAllClients: (req, res) => {
        sequelize.query(`select * from cc_clients join cc_users on cc_clients.client_id = cc_users.user_id;`) 
            .then((dbres) => {
                console.log(res);
                return res.status(200).send(dbres[0]);
            })
            .catch(err => console.log(err)) 
    },

    getPendingAppointments: (req, res) => {
        sequelize.query(`select * from cc_appointments where completed = false order by date`)
            .then((dbres) => {
                return res.status(200).send(dbres[0]);
            })
            .catch(err => console.log(err));
    },

    getPastAppointments: (req, res) => {
        sequelize.query(`select cca.appt_id, cca.date, cca.service_type, cca.notes, ccu.first_name, ccu.last_name
        from cc_appointments cca
        join cc_emp_appts ccea on cca.appt_id = ccea.appt_id
        join cc_employees cce on ccea.emp_id = cce.emp_id
        join cc_users ccu on cce.user_id = ccu.user_id
        where approved = true and completed = true
        order by date desc;`)
        .then((dbres) => {
            return res.status(200).send(dbres[0])
        });
    },
    
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false 
        order by a.date desc;`)
            .then(dbRes => {
                console.log(dbRes);
                res.status(200).send(dbRes[0])
            })
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`update cc_appointments set approved = true where appt_id = ${apptId};
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(res[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },

    completeAppointment: (req, res) => {
        let {apptId} = req.body;
        sequelize.query(`update cc_appointments set completed = true where appt_id = ${apptId};`)
            .then((dbres) => {
                return res.status(200).send(dbres[0]);
            })
    }
}

// module.exports.getAllClients()
// module.exports.getUpcomingAppointments()

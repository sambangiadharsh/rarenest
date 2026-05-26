require('dotenv').config();
const { poolPromise, sql } = require('../src/config/db');

const CMS_PAGES = [
    {
        page_key: 'about_us',
        title: 'About RareNest',
        content: '<p>RareNest connects buyers with extraordinary alternative dwellings worldwide.</p>',
        meta_title: 'About Us | RareNest',
        meta_description: 'Learn about RareNest and our mission to showcase unique homes.',
    },
    {
        page_key: 'terms_and_conditions',
        title: 'Terms and Conditions',
        content: '<p>Please review our terms and conditions for using the RareNest platform.</p>',
        meta_title: 'Terms and Conditions | RareNest',
        meta_description: 'Terms and conditions for using RareNest.',
    },
    {
        page_key: 'privacy_policy',
        title: 'Privacy Policy',
        content: '<p>Your privacy matters to us. This policy explains how we handle your data.</p>',
        meta_title: 'Privacy Policy | RareNest',
        meta_description: 'RareNest privacy policy.',
    },
];

async function seedCms() {
    try {
        const pool = await poolPromise;

        for (const page of CMS_PAGES) {
            const existing = await pool.request()
                .input('page_key', sql.NVarChar, page.page_key)
                .query('SELECT id FROM CMSPages WHERE page_key = @page_key');

            if (existing.recordset.length > 0) {
                console.log(`CMS page already exists: ${page.page_key}`);
                continue;
            }

            await pool.request()
                .input('page_key', sql.NVarChar, page.page_key)
                .input('title', sql.NVarChar, page.title)
                .input('content', sql.NVarChar, page.content)
                .input('meta_title', sql.NVarChar, page.meta_title)
                .input('meta_description', sql.NVarChar, page.meta_description)
                .query(`
                    INSERT INTO CMSPages (page_key, title, content, meta_title, meta_description, status)
                    VALUES (@page_key, @title, @content, @meta_title, @meta_description, 'Published')
                `);
            console.log(`Created CMS page: ${page.page_key}`);
        }

        const contactExisting = await pool.request().query('SELECT TOP 1 id FROM ContactInfo');
        if (contactExisting.recordset.length === 0) {
            await pool.request().query(`
                INSERT INTO ContactInfo (
                    support_email, support_phone, office_address,
                    facebook_url, instagram_url, linkedin_url, twitter_url
                )
                VALUES (
                    'hello@rarenest.co', '+1 555 0100', '123 Nest Lane, Portland, OR',
                    'https://facebook.com/rarenest',
                    'https://instagram.com/rarenest',
                    'https://linkedin.com/company/rarenest',
                    'https://x.com/rarenest'
                )
            `);
            console.log('Created default ContactInfo row');
        } else {
            await pool.request().query(`
                UPDATE ContactInfo
                SET facebook_url = COALESCE(NULLIF(LTRIM(RTRIM(facebook_url)), ''), 'https://facebook.com/rarenest'),
                    instagram_url = COALESCE(NULLIF(LTRIM(RTRIM(instagram_url)), ''), 'https://instagram.com/rarenest'),
                    linkedin_url = COALESCE(NULLIF(LTRIM(RTRIM(linkedin_url)), ''), 'https://linkedin.com/company/rarenest'),
                    twitter_url = COALESCE(NULLIF(LTRIM(RTRIM(twitter_url)), ''), 'https://x.com/rarenest')
                WHERE facebook_url IS NULL OR instagram_url IS NULL
                   OR linkedin_url IS NULL OR twitter_url IS NULL
                   OR LTRIM(RTRIM(facebook_url)) = ''
                   OR LTRIM(RTRIM(instagram_url)) = ''
                   OR LTRIM(RTRIM(linkedin_url)) = ''
                   OR LTRIM(RTRIM(twitter_url)) = ''
            `);
            console.log('ContactInfo row already exists (social URLs backfilled if missing)');
        }

        const faqExisting = await pool.request().query('SELECT TOP 1 id FROM FAQs');
        if (faqExisting.recordset.length === 0) {
            await pool.request().query(`
                INSERT INTO FAQs (question, answer, is_active)
                VALUES (
                    'How do I list a property?',
                    '<p>Create an account, go to your dashboard, and use the listing form to submit your dwelling.</p>',
                    1
                )
            `);
            console.log('Created sample FAQ');
        }

        const careerExisting = await pool.request().query('SELECT TOP 1 id FROM Careers');
        if (careerExisting.recordset.length === 0) {
            await pool.request().query(`
                INSERT INTO Careers (title, department, location, employment_type, experience_level,
                    description, requirements, salary_range, application_email, status)
                VALUES (
                    'Community Manager',
                    'Operations',
                    'Remote',
                    'Full-time',
                    'Mid-level',
                    '<p>Help grow our community of alternative dwelling enthusiasts.</p>',
                    '<p>2+ years experience in community or marketing roles.</p>',
                    'Competitive',
                    'careers@rarenest.co',
                    'Open'
                )
            `);
            console.log('Created sample career posting');
        }

        console.log('CMS seed complete.');
        process.exit(0);
    } catch (err) {
        console.error('CMS seed failed:', err.message);
        process.exit(1);
    }
}

seedCms();

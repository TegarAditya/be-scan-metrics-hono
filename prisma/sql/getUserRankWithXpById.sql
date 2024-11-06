-- @param {String} $1:user_id User id
SELECT *
FROM (
    SELECT
        `User`.`name`, 
        `User`.school, 
        `User`.class, 
        SUM(ScanMetric.scan_xp) AS scan_xp_total,
        `User`.id,
        RANK() OVER (ORDER BY SUM(ScanMetric.scan_xp) DESC) AS rank
    FROM
        `User`
    LEFT JOIN
        ScanMetric
    ON 
        `User`.id = ScanMetric.user_id
    GROUP BY
        `User`.id
) AS ranked_users
WHERE ranked_users.id = ?;
import json
import os

import frappe
from frappe import _
from frappe.utils import nowdate


def get_context(context):
	if frappe.session.user == "Guest":
		frappe.local.flags.redirect_location = "/login?redirect-to=/crm"
		raise frappe.Redirect

	context.no_cache = 1
	context["app_name"] = frappe.get_hooks("app_name")[0]


@frappe.whitelist(allow_guest=True)
def get_context_for_dev():
	boot = frappe.boot.get_bootinfo()
	boot["__messages"] = frappe.get_language_dict("en")
	return {
		"boot": json.dumps(boot),
		"layout_direction": "ltr",
	}


@frappe.whitelist()
def get_dashboard_data():
	today = nowdate()

	total_leads = frappe.db.count("Lead")
	total_opportunities = frappe.db.count("Opportunity")
	total_customers = frappe.db.count("Customer")
	won_opportunities = frappe.db.count("Opportunity", {"status": "Closed Won"})

	leads_by_status = frappe.db.get_list(
		"Lead",
		fields=["status", "count(name) as count"],
		group_by="status",
		order_by="count desc",
	)

	opportunities_by_stage = frappe.db.get_list(
		"Opportunity",
		fields=["sales_stage as stage", "count(name) as count"],
		group_by="sales_stage",
		order_by="count desc",
	)

	monthly_trend = frappe.db.sql("""
		SELECT
			DATE_FORMAT(creation, '%b') as month,
			SUM(CASE WHEN `tabLead`.name IS NOT NULL THEN 1 ELSE 0 END) as leads,
			SUM(CASE WHEN `tabOpportunity`.name IS NOT NULL THEN 1 ELSE 0 END) as opportunities
		FROM (
			SELECT creation, 'Lead' as type FROM `tabLead`
			UNION ALL
			SELECT creation, 'Opportunity' as type FROM `tabOpportunity`
		) combined
		LEFT JOIN `tabLead` ON combined.type = 'Lead' AND combined.creation = `tabLead`.creation
		LEFT JOIN `tabOpportunity` ON combined.type = 'Opportunity' AND combined.creation = `tabOpportunity`.creation
		WHERE combined.creation >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
		GROUP BY MONTH(combined.creation)
		ORDER BY MONTH(combined.creation)
		LIMIT 6
	""", as_dict=True)

	return {
		"total_leads": total_leads,
		"total_opportunities": total_opportunities,
		"total_customers": total_customers,
		"won_opportunities": won_opportunities,
		"leads_by_status": leads_by_status,
		"opportunities_by_stage": opportunities_by_stage,
		"monthly_trend": monthly_trend,
	}

import Alert from 'olive/components/alert'
import Select from 'olive/plugins/select'
import Waiting from 'olive/components/waiting'
import Modal, { ModalHelper } from '../components/modal'
import AjaxRedirect from 'olive/mvc/ajaxRedirect'
import CrossDomainEvent from 'olive/components/crossDomainEvent'
import Form from 'olive/components/form'
import FormAction from './formAction';

export default class StandardAction implements IService {

    constructor(private alert: Alert,
        private form: Form,
        private formAction: FormAction,
        private waiting: Waiting,
        private ajaxRedirect: AjaxRedirect,
        private select: Select,
        private modalHelper: ModalHelper) { }

    public enableLinkModal(selector: JQuery) {
        selector.off("click.open-modal").on("click.open-modal", (e) => {
            if ($(e.currentTarget).attr("data-mode") === "iframe") {
                this.openModaliFrame(e);
            }
            else {
                this.openModal(e);
            }

            return false;
        });
    }

    public runStartup(container: JQuery = null, trigger: any = null, stage: string = "Init") {
        if (container == null) container = $(document);
        if (trigger == null) trigger = $(document);
        let actions = [];
        $("input[name='Startup.Actions']", container).each((index, item) => {
            let action = $(item).val();
            if (actions.indexOf(action) === -1) {
                //sometimes, we have a duplicate route in the action string, so we should remove them manually.
                let names = action.trimStart("[{").trimEnd("}]").split("},{");
                let uniqueNames = [];
                $.each(names, (i, el) => {
                    if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                });
                let stringResult = "[{";
                $.each(uniqueNames, (i, itm) => {
                    stringResult += itm + "},{";
                });
                stringResult = stringResult.trimEnd(",{") + "]";
                actions.push(stringResult);
            }

        });

        for (let action of actions) {
            if (action && (action.Stage || "Init") == stage) this.runAll(JSON.safeParse(action), trigger);
        }
    }

    public runAll(actions: any, trigger: any = null) {
        for (let action of actions) {
            if (!this.run(action, trigger)) return;
        }
    }

    run(action: any, trigger: any): boolean {
        if (action.Notify || action.Notify == "") this.notify(action, trigger);
        else if (action.Script) eval(action.Script);
        else if (action.BrowserAction == "Back") window.history.back();
        else if (action.BrowserAction == "CloseModal") { if (window.page.modal.closeMe() === false) return false; }
        else if (action.BrowserAction == "CloseModalRebindParent") {
            let opener = this.modalHelper.currentModal.opener;
            if (window.page.modal.closeMe() === false) return false;
            if (opener) {
                let data = this.form.getPostData(opener.parents('form'));
                $.post(window.location.href, data, (response) => {
                    this.formAction.processAjaxResponse(response, opener.closest("[data-module]"), opener, null);
                });
            }
            else {
                CrossDomainEvent.raise(parent, 'refresh-page');
            }
        }
        else if (action.BrowserAction == "CloseModalRefreshParent") {
            window.page.modal.closeMe();
            CrossDomainEvent.raise(parent, 'refresh-page');
        }
        else if (action.BrowserAction == "Close") window.close();
        else if (action.BrowserAction == "Refresh") window.page.refresh();
        else if (action.BrowserAction == "Print") window.print();
        else if (action.BrowserAction == "ShowPleaseWait") this.waiting.show(action.BlockScreen);
        else if (action.ReplaceSource) this.select.replaceSource(action.ReplaceSource, action.Items);
        else if (action.Download) window.download(action.Download);
        else if (action.Redirect) this.redirect(action, trigger);
        else alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());

        return true;
    }

    notify(action: any, trigger: any) {
        if (action.Obstruct == false)
            this.alert.alertUnobtrusively(action.Notify, action.Style);
        else this.alert.alert(action.Notify, action.Style);
    }

    redirect(action: any, trigger: any) {
        if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
            action.Redirect = '/' + action.Redirect;

        if (action.OutOfModal && window.isModal()) parent.window.location.href = action.Redirect;
        else if (action.Target == '$modal') this.openModal({ currentTarget: trigger }, action.Redirect, null);
        else if (action.Target && action.Target != '') window.open(action.Redirect, action.Target);
        else if (action.WithAjax === false) location.replace(action.Redirect);
        else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
            this.ajaxRedirect.go(action.Redirect, trigger, false, false, true);
        else location.replace(action.Redirect);
    }

    openModal(event, url?, options?): any {
        this.modalHelper.close();
        //new Modal(event, url, options).open();
        throw 'Not implemented';
    }

    openModaliFrame(event, url?, options?): void {
        this.modalHelper.close();
        //new Modal(event, url, options).openiFrame();
        throw 'Not implemented';
    }
}
